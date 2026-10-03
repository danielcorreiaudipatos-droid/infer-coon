# ⚡ IMPLEMENTATION EXECUTION - TUDO AGORA

**Status:** STARTING NOW | **Target:** Ambos projetos hoje

---

## 🎯 ESTRATÉGIA RÁPIDA

Em vez de reescrever tudo, vou:

1. **Criar extensões** aos serviços existentes (não reescrever)
2. **Adicionar features** incrementalmente
3. **Replicar** para COON depois
4. **Testar** enquanto vai

---

## 📝 IMPLEMENTAÇÃO POR ORDEM

### 1. CONFIG UPDATE (5 min)

**Arquivo:** `src/config/games.config.ts`

Adicionar:
```javascript
// Multipliers
multipliers: {
  timeMultiplier: { 30: 1.0, 60: 1.1, 120: 1.25, 180: 1.5 },
  comboMultiplier: 0.1,
  perfectionBonus: 1.0,
}

// Progression
progression: {
  levels: 100,
  pointsPerLevel: (level) => level * 500,
  rewardPerLevel: 0.50,
}

// Daily Challenges
challenges: {
  daily: [
    { name: 'Score3000', reward: 1.00 },
    { name: 'Play5Games', reward: 1.00 },
    { name: 'Get50Combo', reward: 2.00 },
  ],
  completionBonus: 1.00,
}
```

### 2. DATABASE UPDATES (10 min)

**Arquivo:** `prisma/schema.prisma`

Adicionar campos:
```prisma
model User {
  // ... existing fields
  level Int @default(1)
  totalPoints Int @default(0)
  badges [String] @default([])
  dailyChallengesCompleted Int @default(0)
  multiplierStreak Int @default(0)
}

model GameSession {
  // ... existing fields
  multiplier Float @default(1.0)
  combo Int @default(0)
  maxCombo Int @default(0)
}

model DailyChallenge {
  id String @id @default(cuid())
  userId String
  date DateTime
  challenges JSON
  completed Boolean @default(false)
  reward Float
}
```

### 3. SERVICE UPDATES - ONZAP (15 min)

**Adicionar ao `onzap.service.ts`:**

```typescript
// Multiplier calculation
calculateMultiplier(duration: number, combo: number): number {
  let timeMultiplier = 1.0;
  
  if (duration > 180) timeMultiplier = 1.5;
  else if (duration > 120) timeMultiplier = 1.25;
  else if (duration > 60) timeMultiplier = 1.1;
  
  const comboMultiplier = 1 + (combo * 0.1);
  return timeMultiplier * comboMultiplier;
}

// Updated reward calculation
calculateReward(score: number, duration: number, combo: number): {cash, points, level} {
  const multiplier = this.calculateMultiplier(duration, combo);
  const baseReward = score * GAME_CONFIG.onzap.rewardPerPoint;
  const cash = Math.min(
    Math.max(baseReward * multiplier, 0.10),
    100
  );
  
  const points = Math.floor(score / 10);
  const level = Math.floor(points / 500) + 1;
  
  return { cash: parseFloat(cash.toFixed(2)), points, level };
}

// Daily challenges
async checkDailyChallenges(userId: string, score: number, combo: number) {
  const today = new Date().toDateString();
  let dailyChallenge = await this.prisma.dailyChallenge.findFirst({
    where: { userId, date: today }
  });
  
  if (!dailyChallenge) {
    dailyChallenge = await this.prisma.dailyChallenge.create({
      data: { userId, date: new Date(), challenges: {} }
    });
  }
  
  // Check challenges
  let bonusReward = 0;
  const challenges = dailyChallenge.challenges || {};
  
  if (score > 3000 && !challenges.score3000) {
    challenges.score3000 = true;
    bonusReward += 1.00;
  }
  
  if (!challenges.play5games) {
    challenges.gamesPlayed = (challenges.gamesPlayed || 0) + 1;
    if (challenges.gamesPlayed >= 5) {
      challenges.play5games = true;
      bonusReward += 1.00;
    }
  }
  
  if (combo > 50 && !challenges.combo50) {
    challenges.combo50 = true;
    bonusReward += 2.00;
  }
  
  // Save and return
  await this.prisma.dailyChallenge.update({
    where: { id: dailyChallenge.id },
    data: { challenges }
  });
  
  // Check if all completed
  const allCompleted = challenges.score3000 && challenges.play5games && challenges.combo50;
  if (allCompleted) bonusReward += 1.00;
  
  return bonusReward;
}
```

### 4. SERVICE UPDATES - ONLOVE (15 min)

**Adicionar ao `onlove.service.ts`:**

```typescript
// Reaction types
calculateReactionBonus(reactionType: 'love' | 'like' | 'maybe' | 'pass' | 'block'): number {
  const bonuses = {
    love: 2.0,
    like: 1.0,
    maybe: 0.5,
    pass: 0.0,
    block: 0.0,
  };
  return bonuses[reactionType];
}

// Mutual matches
async trackMutualMatch(userId: string, targetUserId: string, reactionType: string) {
  if (reactionType === 'love' || reactionType === 'like') {
    // Check if target also liked user (would need reverse tracking)
    // For now, just track the like
    await this.prisma.mutualMatch.create({
      data: { userId, targetUserId, reaction: reactionType }
    });
  }
}

// Profile enrichment
async getEnrichedProfile(profileId: string) {
  // Return profile with: bio, interests, age, location
  // Can be random-generated or from database
  return {
    id: profileId,
    name: 'Example User',
    age: Math.floor(Math.random() * 40) + 18,
    bio: 'Love traveling and dogs',
    interests: ['hiking', 'gaming', 'cooking'],
    location: 'São Paulo',
    rating: Math.random() * 5,
  };
}
```

### 5. SERVICE UPDATES - ONMAIL (15 min)

**Adicionar ao `onmail.service.ts`:**

```typescript
// Difficulty modes
validateByDifficulty(difficulty: 'easy' | 'normal' | 'hard', waves: number, duration: number): boolean {
  const minTimes = {
    easy: waves * 5 * 1000,
    normal: waves * 10 * 1000,
    hard: waves * 15 * 1000,
  };
  return duration >= minTimes[difficulty];
}

// Reward by difficulty
calculateRewardByDifficulty(score: number, waves: number, difficulty: string): number {
  const baseReward = (waves * 1.00) + (score * 0.005);
  
  const multipliers = {
    easy: 0.5,
    normal: 1.0,
    hard: 2.0,
  };
  
  let reward = baseReward * multipliers[difficulty];
  
  if (waves === 20) {
    reward += 5.00;
  }
  
  return parseFloat(reward.toFixed(2));
}

// Tower upgrades
async upgradeTower(userId: string, towerType: string, fromLevel: number): number {
  const upgradeCosts = { 1: 100, 2: 200, 3: 300, 4: 400, 5: 500 };
  return upgradeCosts[fromLevel + 1] || 0;
}

// Tower synergies
calculateSynergyBonus(tower1: string, tower2: string): number {
  const synergies = {
    'firewall_filter': 1.2,
    'filter_scanner': 1.15,
    'scanner_trap': 1.15,
    'trap_firewall': 1.2,
  };
  
  const key = `${tower1}_${tower2}`;
  return synergies[key] || 1.0;
}
```

### 6. LANDING PAGES (20 min)

**Criar:**
- `src/pages/landing/onzap.tsx`
- `src/pages/landing/onlove.tsx`
- `src/pages/landing/onmail.tsx`

Cada um com: Hero, How it works, Features, Testimonials, CTA, FAQ

---

## 🔄 IMPLEMENTAÇÃO TIMELINE

```
0-5 min:   Config update
5-15 min:  Database updates (Prisma)
15-30 min: Service updates (ONZAP + ONLOVE + ONMAIL)
30-50 min: Landing pages (3 pages)
50-60 min: Frontend components (cosmetics shop)
60-70 min: Wallet integration
70-80 min: Analytics setup
80-90 min: COON replication (copiar/colar)
90-100 min: Testing + fixes
```

**Total: ~100 minutos = ~2 horas**

---

Próximo passo: Escolher por onde começar!

