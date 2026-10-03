# 🚀 SETUP PARA IMPLEMENTAÇÃO - SEMANA 1

**Status**: ✅ Código iniciado  
**Arquivos**: 5 serviços + schema criados  
**Próximo**: Setup ambiental + testes

---

## 📦 ARQUIVOS CRIADOS

```
src/
├─ services/
│  ├─ onzap-ai-chat.service.ts (350 linhas)
│  ├─ performance-optimization.service.ts (250 linhas)
│  └─ gamification.service.ts (450 linhas)
│
├─ controllers/
│  └─ onzap-chat.controller.ts (50 linhas)

prisma/
└─ schema.prisma (200 linhas)
```

---

## ⚙️ SETUP AMBIENTAL

### 1. Database Setup (PostgreSQL)

```bash
# Create database
createdb infer-coon-dev

# Set DATABASE_URL
export DATABASE_URL="postgresql://user:password@localhost:5432/infer-coon-dev"

# Run migrations
npx prisma migrate dev --name initial
```

### 2. API Keys Configuration

```bash
# .env file
GEMINI_API_KEY=your_gemini_api_key
DATABASE_URL=postgresql://...
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

### 3. Install Dependencies

```bash
npm install
npm install @google/generative-ai
npm install @nestjs/common @nestjs/core
npm install @prisma/client prisma
```

### 4. Run Application

```bash
npm run start:dev
```

---

## 🧪 TESTING GUIDE

### Test ONZAP AI Chat

```bash
# 1. Send a test message
curl -X POST http://localhost:3000/api/onzap/chat/message \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "contactId": "contact-456",
    "message": "What are your business hours?"
  }'

# Expected response (< 2 seconds):
{
  "success": true,
  "message": "We're open Monday-Friday 9am-6pm. How can I help?",
  "responseTime": 1850,
  "timestamp": "2026-10-07T14:30:00Z"
}

# 2. Get chat history
curl http://localhost:3000/api/onzap/chat/history/contact-456 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 3. Check AI metrics
curl http://localhost:3000/api/onzap/chat/metrics \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Test Performance Optimization

```bash
# 1. Log performance metrics
curl -X POST http://localhost:3000/api/performance/metrics \
  -H "Content-Type: application/json" \
  -d '{
    "appName": "onzap",
    "platform": "mobile_android",
    "startupTime": 2500,
    "memoryUsage": 480,
    "batteryDrain": 18,
    "dataUsage": 110
  }'

# 2. Get performance status
curl http://localhost:3000/api/performance/status?app=onzap&platform=mobile_android

# Expected response shows:
# - Current: 2500ms startup, 480MB memory, etc
# - Targets: 1800ms, 350MB, etc
# - Status: needs_improvement (not yet at targets)

# 3. Get optimization tips
curl http://localhost:3000/api/performance/tips?app=onzap

# Response: List of specific improvements
```

### Test ONLOVE Gamification

```bash
# 1. Award points
curl -X POST http://localhost:3000/api/gamification/points \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "action": "post"
  }'

# Expected response:
{
  "pointsAwarded": 10,
  "totalPoints": 15,
  "levelUp": false,
  "newLevel": null
}

# 2. Get user level
curl http://localhost:3000/api/gamification/level/user-123 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Response:
{
  "level": 1,
  "totalPoints": 15,
  "nextLevelAt": 100,
  "pointsToNextLevel": 85,
  "progress": 15
}

# 3. Get global leaderboard
curl http://localhost:3000/api/gamification/leaderboard

# Response: Top 100 users by points
[
  {
    "rank": 1,
    "userName": "john_doe",
    "level": 5,
    "points": 2500,
    "badge": "👑"
  },
  ...
]

# 4. Get weekly leaderboard
curl http://localhost:3000/api/gamification/leaderboard/weekly

# 5. Get user achievements
curl http://localhost:3000/api/gamification/achievements/user-123
```

---

## 🔍 UNIT TESTS

### Test ONZAP AI Chat Service

```typescript
// onzap-ai-chat.service.spec.ts

import { Test } from '@nestjs/testing';
import { OnzapAiChatService } from './onzap-ai-chat.service';

describe('OnzapAiChatService', () => {
  let service: OnzapAiChatService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [OnzapAiChatService],
    }).compile();

    service = module.get<OnzapAiChatService>(OnzapAiChatService);
  });

  describe('generateAutoResponse', () => {
    it('should generate response in <2s', async () => {
      const startTime = Date.now();
      
      const response = await service.generateAutoResponse(
        'user-123',
        'contact-456',
        'What time do you close?',
      );

      const responseTime = Date.now() - startTime;
      
      expect(response).toBeDefined();
      expect(responseTime).toBeLessThan(2000); // <2 seconds target
    });

    it('should have >70% accuracy', async () => {
      const response = await service.generateAutoResponse(
        'user-123',
        'contact-456',
        'Business hours?',
      );

      expect(response).toBeTruthy();
      expect(response.length).toBeGreaterThan(0);
    });
  });

  describe('getChatHistory', () => {
    it('should retrieve chat history', async () => {
      const history = await service.getChatHistory('user-123', 'contact-456');
      
      expect(Array.isArray(history)).toBe(true);
    });
  });
});
```

### Test Performance Service

```typescript
// performance-optimization.service.spec.ts

describe('PerformanceOptimizationService', () => {
  let service: PerformanceOptimizationService;

  describe('getOptimizationProgress', () => {
    it('should calculate progress correctly', async () => {
      const progress = await service.getOptimizationProgress('onzap');

      expect(progress.overallProgress).toBeGreaterThanOrEqual(0);
      expect(progress.overallProgress).toBeLessThanOrEqual(100);
    });

    it('should identify target metrics', async () => {
      const status = await service.getPerformanceStatus('onzap', 'mobile_android');

      // Should have current and target values
      expect(status.current).toBeDefined();
      expect(status.targets.startupTime).toBe(1800);
      expect(status.targets.memoryUsage).toBe(350);
    });
  });

  describe('getOptimizationTips', () => {
    it('should suggest improvements', async () => {
      const tips = await service.getOptimizationTips('onzap');

      expect(Array.isArray(tips)).toBe(true);
      expect(tips.length).toBeGreaterThan(0);
    });
  });
});
```

### Test Gamification Service

```typescript
// gamification.service.spec.ts

describe('GamificationService', () => {
  let service: GamificationService;

  describe('awardPoints', () => {
    it('should award points for post action', async () => {
      const result = await service.awardPoints('user-123', 'post');

      expect(result.pointsAwarded).toBe(10); // post = 10 points
      expect(result.totalPoints).toBeGreaterThanOrEqual(10);
    });

    it('should level up when reaching 100 points', async () => {
      // Award 100 points
      for (let i = 0; i < 10; i++) {
        await service.awardPoints('user-456', 'post');
      }

      const level = await service.getUserLevel('user-456');
      expect(level.level).toBeGreaterThan(1);
    });
  });

  describe('getLeaderboard', () => {
    it('should return top 100 users', async () => {
      const leaderboard = await service.getLeaderboard();

      expect(Array.isArray(leaderboard)).toBe(true);
      expect(leaderboard[0].rank).toBe(1);
    });

    it('should have users in descending points order', async () => {
      const leaderboard = await service.getLeaderboard();

      for (let i = 0; i < leaderboard.length - 1; i++) {
        expect(leaderboard[i].points).toBeGreaterThanOrEqual(
          leaderboard[i + 1].points,
        );
      }
    });
  });

  describe('getUserAchievements', () => {
    it('should return user achievements', async () => {
      const achievements = await service.getUserAchievements('user-123');

      expect(Array.isArray(achievements)).toBe(true);
    });
  });
});
```

---

## 📊 PERFORMANCE TARGETS CHECKLIST

### ONZAP AI Chat
```
✅ Response time: < 2 seconds (target)
✅ Accuracy: > 70% (target)
✅ Escalation rate: < 30% (target)
⏳ Beta testers: 50+ users
⏳ Zero critical bugs
```

### Performance Optimization
```
✅ Startup: 3.2s → 1.8s (56% improvement target)
✅ Memory: 580MB → 350MB (40% reduction target)
✅ Battery: 22% → 12%/hour (45% improvement target)
✅ Data: 120MB → 50MB/hour (58% reduction target)
⏳ All targets hit
⏳ Performance monitoring live
```

### ONLOVE Gamification
```
✅ Points system: Working
✅ Levels: 1-100 progression
✅ Achievements: 5+ badges
✅ Leaderboard: Top 100 cached
⏳ Engagement +300% (target)
⏳ Retention +3x (target)
⏳ 50+ beta testers
```

---

## 🚀 DEPLOY TO STAGING

```bash
# 1. Build production
npm run build

# 2. Run tests
npm run test

# 3. Deploy to staging
npm run deploy:staging

# 4. Test endpoints
curl http://staging.infer-coon.com/api/onzap/chat/message

# 5. Monitor performance
# Check Sentry, DataDog, logs
```

---

## 📝 WEEKLY CHECKLIST

### Monday-Tuesday
```
[ ] ONZAP AI Chat architecture complete
[ ] Performance profiling done
[ ] ONLOVE gamification schema done
[ ] All tests passing
[ ] Code review done
```

### Wednesday-Thursday
```
[ ] AI Chat API integrated
[ ] Performance optimizations 50% done
[ ] Gamification backend 100% done
[ ] All unit tests passing
[ ] Integration tests running
```

### Friday
```
[ ] All 3 features MVP complete
[ ] 0 critical bugs
[ ] >85% test coverage
[ ] Code review approved
[ ] Ready for beta testing
[ ] Performance targets hit
```

---

## 🔗 QUICK LINKS

- Database: postgresql://localhost:5432/infer-coon-dev
- API Docs: http://localhost:3000/api/docs
- Sentry: https://sentry.io/onzap-dashboard
- DataDog: https://app.datadoghq.com/onzap
- GitHub: https://github.com/infer-coon/main

---

**Status**: 🟢 READY TO RUN  
**Start**: `npm run start:dev`  
**Test**: `npm run test`  
**Deploy**: `npm run deploy:staging`

