# 🎮 Arquitetura Perfeita: Games + Wallet + Studio + IA

## 📐 Estrutura do Ambiente (Primeiro)

```
┌─────────────────────────────────────────────────────┐
│                  GAMES PLATFORM                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │ FRONTEND (React + Phaser.js)                 │  │
│  │ ├─ ONZAP Game                                │  │
│  │ ├─ ONLOVE Game                               │  │
│  │ ├─ ONMAIL Game                               │  │
│  │ └─ Studio (Game Builder)                     │  │
│  └──────────────────────────────────────────────┘  │
│                        ↓                           │
│  ┌──────────────────────────────────────────────┐  │
│  │ API GATEWAY (NestJS)                         │  │
│  │ ├─ /api/games/*                              │  │
│  │ ├─ /api/wallet/*                             │  │
│  │ ├─ /api/studio/*                             │  │
│  │ └─ /api/ia/*                                 │  │
│  └──────────────────────────────────────────────┘  │
│         ↓              ↓              ↓            │
│  ┌─────────────┐ ┌──────────┐ ┌────────────┐     │
│  │   WALLET    │ │ DATABASE │ │ EXTERNAL   │     │
│  │  (Payments) │ │(Prisma)  │ │   APIs     │     │
│  └─────────────┘ └──────────┘ └────────────┘     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 🏗️ Stack Técnico Completo

### TIER 1: Frontend (Client)
```typescript
// Framework
- React 18+
- TypeScript
- Next.js (para SSR + API routes)

// Games
- Phaser 3 (game engine)
- Babylon.js (alternativa 3D)

// State Management
- Redux Toolkit (player state, scores)
- React Query (API caching)

// UI Components
- Material-UI ou ShadcnUI
- Tailwind CSS

// Analytics
- PostHog (rastrear conversões)
- Sentry (error tracking)

// Payments
- Stripe.js (frontend integration)
```

### TIER 2: API Gateway (Backend)
```typescript
// Framework
- NestJS 10+
- TypeScript

// Modules
- @nestjs/games (game logic)
- @nestjs/wallet (payment logic)
- @nestjs/studio (game builder)
- @nestjs/ai (IA integration)

// Middleware
- JWT Auth
- Rate Limiting (Redis)
- CORS
- Request Logging

// APIs Integradas
- Stripe (Payments)
- Google OAuth
- OpenAI/Gemini (IA)
- Sentry
- PostHog
```

### TIER 3: Database
```sql
-- PostgreSQL via Prisma

Tables:
- users (id, email, name, createdAt)
- game_scores (userId, gameId, score, date)
- wallets (userId, balance, currency)
- transactions (userId, type, amount, reason)
- cosmetics (id, name, price, gameId)
- user_cosmetics (userId, cosmeticId)
- game_themes (id, name, config, userId)
- studio_projects (userId, name, data, published)
- ai_generations (userId, prompt, result, cost)
- subscriptions (userId, plan, status, expiresAt)
```

### TIER 4: External APIs
```
1. Stripe (Payments)
2. Google Cloud (OAuth + IA - Gemini)
3. OpenAI (IA alternative)
4. PostHog (Analytics)
5. Sentry (Error tracking)
6. SendGrid (Email)
```

---

## 🎮 Estrutura de Games

### Folder Structure
```
src/
├── games/
│   ├── onzap/
│   │   ├── scenes/
│   │   │   ├── BootScene.ts
│   │   │   ├── MenuScene.ts
│   │   │   ├── GameScene.ts
│   │   │   └── GameOverScene.ts
│   │   ├── sprites/
│   │   │   ├── Message.ts
│   │   │   └── Player.ts
│   │   ├── config/
│   │   │   └── GameConfig.ts
│   │   └── OnzapGame.ts
│   ├── onlove/
│   │   └── (mesma estrutura)
│   ├── onmail/
│   │   └── (mesma estrutura)
│   └── BaseGame.ts (classe abstrata)
├── studio/
│   ├── builder/
│   │   ├── GameBuilder.ts
│   │   ├── SpriteEditor.ts
│   │   └── SceneEditor.ts
│   └── preview/
│       └── GamePreview.ts
└── ...
```

---

## 💳 Integração Wallet

### Fluxo de Pagamento
```
┌─────────────────────────────────────┐
│ Usuario Quer Comprar Cosmetic       │
├─────────────────────────────────────┤
│ 1. Clica "Comprar Skin"             │
│    └─ Custo: R$ 4,99                │
│                                     │
│ 2. Sistema valida saldo wallet      │
│    ✓ Saldo: R$ 10 (tem)             │
│                                     │
│ 3. Stripe charge iniciado           │
│    └─ Charge ID: ch_xxx             │
│                                     │
│ 4. Payment authorized               │
│    └─ Wallet: R$ 10 - R$ 4,99       │
│    └─ Novo saldo: R$ 5,01           │
│                                     │
│ 5. Cosmetic desbloqueado            │
│    └─ User_Cosmetic criada          │
│                                     │
│ 6. Email enviado (confirmação)      │
│    └─ Via SendGrid                  │
│                                     │
│ 7. Analytics registrado             │
│    └─ Via PostHog                   │
└─────────────────────────────────────┘
```

### Wallet Service (NestJS)
```typescript
// src/services/wallet.service.ts
@Injectable()
export class WalletService {
  
  async getBalance(userId: string) {
    return this.prisma.wallet.findUnique({
      where: { userId }
    });
  }

  async debit(userId: string, amount: number, reason: string) {
    // Transação atômica
    return this.prisma.$transaction(async (tx) => {
      // 1. Validar saldo
      const wallet = await tx.wallet.findUnique({
        where: { userId }
      });
      
      if (wallet.balance < amount) {
        throw new Error('Insufficient balance');
      }
      
      // 2. Debitar
      const updated = await tx.wallet.update({
        where: { userId },
        data: { balance: wallet.balance - amount }
      });
      
      // 3. Registrar transação
      await tx.transaction.create({
        data: {
          userId,
          type: 'debit',
          amount,
          reason,
          balanceBefore: wallet.balance,
          balanceAfter: updated.balance
        }
      });
      
      return updated;
    });
  }

  async credit(userId: string, amount: number, reason: string) {
    // Similar ao debit mas soma
  }

  async purchaseCosmeticWithWallet(
    userId: string,
    cosmeticId: string
  ) {
    const cosmetic = await this.prisma.cosmetic.findUnique({
      where: { id: cosmeticId }
    });
    
    // Debitar wallet
    await this.debit(userId, cosmetic.price, `Cosmetic: ${cosmeticId}`);
    
    // Adicionar ao usuário
    await this.prisma.userCosmetic.create({
      data: { userId, cosmeticId }
    });
    
    return { success: true, cosmetic };
  }
}
```

---

## 🤖 Integração IA (Google Gemini)

### O que IA vai fazer nos Games

#### 1. **Game Builder IA** (Studio)
```
User: "Quero um jogo tipo Flappy Bird mas com pizzas"

IA (Gemini):
1. Analisa descrição
2. Gera configuração de jogo
3. Cria sprites automáticos (via Gemini Vision)
4. Sugere colores, sons, mecânicas
5. Retorna código Phaser.js pronto

Custo: R$ 0,01-0,10 por geração
Monetiza: User paga R$ 4,99 para publicar
```

#### 2. **IA Difficulty Adjustment**
```
Game em progresso:
- Player está achando muito fácil (completing 100% das fases)
- IA detecta
- Aumenta dificuldade gradualmente
- Player fica engajado (sweet spot)

Resultado: +30% retention
```

#### 3. **IA Cosmetic Designer**
```
User: "Quero uma skin ninja mas com tema cyberpunk"

IA (Gemini Vision):
1. Gera prompt visual
2. Cria sprite via DALL-E ou Midjourney
3. User edita se quiser
4. Publica no store

Preço: User paga R$ 9,99
Você tira 70% = R$ 6,99
```

### IA Service (NestJS)
```typescript
// src/services/ia.service.ts
@Injectable()
export class IaService {
  
  async generateGameConfig(description: string) {
    const response = await this.gemini.generateContent({
      contents: [{
        role: 'user',
        parts: [{
          text: `
            Crie configuração de jogo Phaser.js baseado em:
            ${description}
            
            Retorne JSON com:
            {
              name: string,
              difficulty: number,
              sprites: [{ name, url }],
              mechanics: string[],
              colors: string[],
              code: string (Phaser config)
            }
          `
        }]
      }]
    });
    
    return JSON.parse(response.text());
  }

  async generateCosmetic(description: string) {
    // Gerar sprite via IA
    const cosmetic = await this.gemini.generateContent({
      contents: [{
        role: 'user',
        parts: [{
          text: `Crie sprite PNG para cosmetic: ${description}`
        }]
      }]
    });
    
    return cosmetic;
  }

  async analyzePlayerBehavior(userId: string, gameId: string) {
    // Buscar scores e padrões
    const scores = await this.prisma.gameScore.findMany({
      where: { userId, gameId },
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    
    // IA analisa se player está bored ou frustrated
    const analysis = await this.gemini.generateContent({
      contents: [{
        role: 'user',
        parts: [{
          text: `
            Analise esses scores e recomende dificuldade:
            ${JSON.stringify(scores)}
            
            Retorne:
            {
              engagement: 'low' | 'medium' | 'high',
              recommendation: 'increase' | 'decrease' | 'maintain',
              reason: string
            }
          `
        }]
      }]
    });
    
    return JSON.parse(analysis.text());
  }
}
```

---

## 📊 Studio: Game Builder (Painel Interativo)

### O que é Studio
```
Interface web onde users criam seus próprios jogos:

┌──────────────────────────────────────┐
│ STUDIO - Game Builder                │
├──────────────────────────────────────┤
│                                      │
│ [New Game] [My Games] [Marketplace]  │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ Game Name: [______]              │ │
│ │ Template: [Flappy Bird ▼]        │ │
│ │                                  │ │
│ │ Mechanics:                       │ │
│ │ ☑ Jump         ☑ Obstacles      │ │
│ │ ☑ Scoring      ☑ Leaderboard   │ │
│ │                                  │ │
│ │ Colors:                          │ │
│ │ [🟦] [🟩] [🟥] [Add Color]      │ │
│ │                                  │ │
│ │ [Generate with IA] [Create]     │ │
│ └──────────────────────────────────┘ │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ Preview                          │ │
│ │                                  │ │
│ │   [Your Game Preview Here]       │ │
│ │   ▶ Play                         │ │
│ │                                  │ │
│ └──────────────────────────────────┘ │
│                                      │
│ [Publish (R$ 4,99)] [Save Draft]    │
│                                      │
└──────────────────────────────────────┘
```

### Studio Features
```typescript
// src/studio/GameBuilder.ts

export class GameBuilder {
  
  // 1. Selecionar template
  selectTemplate(templateId: string) {
    // Carrega config base do template
  }

  // 2. Customizar sprites
  editSprite(spriteId: string, changes: {}) {
    // Editor visual de sprites
  }

  // 3. Adicionar mecânicas
  addMechanic(mechanicType: 'jump' | 'shoot' | 'collect') {
    // Adiciona lógica de mecânica
  }

  // 4. Gerar com IA
  async generateWithAI(description: string) {
    return this.iaService.generateGameConfig(description);
  }

  // 5. Preview em tempo real
  previewGame() {
    // Roda jogo no editor
  }

  // 6. Publicar
  async publishGame(config: GameConfig) {
    // 1. Valida
    // 2. Minifica código
    // 3. Salva em DB
    // 4. Cria entry no marketplace
    // 5. Retorna URL pública
  }
}
```

---

## 🎯 Melhor Ordem de Implementação

### Fase 1: Infraestrutura Base (Semana 1)
```
Day 1-2: Setup NestJS + Prisma + PostgreSQL
Day 3: Wallet Service (debit/credit)
Day 4: Stripe Integration
Day 5: Auth + Rate Limiting
Day 6-7: Testing + Deploy
```

### Fase 2: Primeiro Game (Semana 2)
```
Day 1-3: ONZAP Game (Flappy Bird)
Day 4: Integrar Wallet (cosmetics)
Day 5: Freemium gates (Free/Pro)
Day 6-7: Marketing + Deploy LIVE
```

### Fase 3: Studio + IA (Semana 3)
```
Day 1-3: Game Builder UI
Day 4: IA Integration (Gemini)
Day 5: Game Preview
Day 6-7: Marketplace
```

### Fase 4: ONLOVE + ONMAIL (Semana 4)
```
Day 1-3: ONLOVE Game
Day 4-7: ONMAIL Game
+ Integração Wallet ambos
+ Studio support
```

---

## 📋 Arquivo de Configuração Completo

```yaml
# games-platform.config.yml

environment: production

database:
  provider: postgresql
  url: ${DATABASE_URL}
  
wallet:
  provider: stripe
  api_key: ${STRIPE_API_KEY}
  webhook_secret: ${STRIPE_WEBHOOK_SECRET}
  
ia:
  provider: google_gemini
  api_key: ${GOOGLE_API_KEY}
  model: gemini-pro
  
games:
  - name: onzap
    type: flappy_bird
    monetization: freemium
    features:
      - cosmetics
      - leaderboard
      - achievements
  - name: onlove
    type: tinder
    monetization: freemium
  - name: onmail
    type: tower_defense
    monetization: freemium

studio:
  enabled: true
  templates: ['flappy_bird', 'tinder', 'tower_defense']
  max_games_free: 3
  max_games_pro: unlimited

analytics:
  provider: posthog
  events:
    - game_started
    - purchase_completed
    - cosmetic_unlocked
    - game_published

notifications:
  email:
    provider: sendgrid
    from: games@seu-site.com
```

---

## 🚀 Checklist: Ambiente Perfeito

### Infraestrutura
- [ ] PostgreSQL Neon (database)
- [ ] Redis (cache + rate limiting)
- [ ] Vercel/Railway (hosting NestJS)
- [ ] Vercel (hosting React frontend)
- [ ] Stripe (payments)
- [ ] Google Cloud (OAuth + Gemini)
- [ ] SendGrid (email)
- [ ] Sentry (error tracking)
- [ ] PostHog (analytics)

### Backend
- [ ] NestJS app structure
- [ ] Wallet module
- [ ] Games module
- [ ] Studio module
- [ ] IA service
- [ ] Auth/JWT
- [ ] Rate limiting middleware
- [ ] Database migrations

### Frontend
- [ ] React + Next.js setup
- [ ] Phaser.js integration
- [ ] Game components
- [ ] Studio builder UI
- [ ] Marketplace page
- [ ] Dashboard

### Features
- [ ] Freemium gates
- [ ] Cosmetics shop
- [ ] Leaderboard
- [ ] IA game generation
- [ ] Wallet integration
- [ ] Social sharing

---

## 💰 Monetização Completa

```
3 Revenue Streams:

1. ADS
   └─ Free users veem ads
   └─ R$ 1-2k/mês (10k users)

2. IN-APP PURCHASES
   └─ Cosmetics via Wallet
   └─ R$ 2-5k/mês (10k users)

3. SUBSCRIPTIONS + STUDIO
   └─ PRO subscription: R$ 9,99/mês
   └─ Game Publishing: R$ 4,99 por jogo
   └─ R$ 10-30k/mês (10k users)

TOTAL: R$ 13-37k/mês por 10k users
ESCALA 100k: R$ 130-370k/mês
```

---

## ✅ Status: Arquitetura Pronta

```
Ambiente: ✅ Definido
Database: ✅ Esquema
APIs: ✅ Estrutura
Wallet: ✅ Integração
Games: ✅ Base (Phaser)
Studio: ✅ Design
IA: ✅ Gemini ready

PRÓXIMO: Implementar
```

**EXECUTOR pode começar SEXTA!** 🚀
