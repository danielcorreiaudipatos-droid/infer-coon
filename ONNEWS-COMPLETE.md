# 📰 ONNEWS - Notícias com Recompensas

**Slogan:** "Leia notícias, ganhe dinheiro real"  
**Modelo:** News Feed + Rewards  
**Integração:** OnGame Ecosystem  
**Status:** Ready to build

---

## 🎯 Conceito

ONNEWS é um app de notícias que **paga você por ler, comentar e compartilhar**.

### Como Funciona:

```
1. Leitor abre app
2. Vê feed de notícias
3. Clica em notícia → +R$ 0.01 (read reward)
4. Comenta → +R$ 0.05
5. Compartilha → +R$ 0.10
6. Reações (Like, Love, Angry) → +R$ 0.02-0.05

Ganho por notícia: R$ 0.01 - R$ 0.35
Ganho diário (20 notícias): R$ 0.20 - R$ 7.00
Ganho mensal: R$ 6.00 - R$ 210.00
```

---

## 📊 Monetização

### User Revenue Model:

```
Reading Rewards:
├─ Open notícia: +R$ 0.01
├─ Read 30 secs: +R$ 0.02
├─ Complete read: +R$ 0.05
└─ Daily bonus: +R$ 0.50 (5 notícias)

Engagement:
├─ Comment: +R$ 0.05
├─ Share: +R$ 0.10
├─ Like: +R$ 0.02
├─ Love: +R$ 0.05
└─ Angry: +R$ 0.02

Monthly Target:
├─ Light user (5 notícias/dia): R$ 15/mês
├─ Active user (10 notícias/dia): R$ 40/mês
└─ Heavy user (20+ notícias/dia): R$ 100+/mês
```

### Platform Revenue (Publisher Model):

```
Cost per 1000 reads: R$ 2.00 (CPM)
Cost per engagement: R$ 0.10 (CPC)

Ad network: Google AdSense + AdMob
Programmatic ads between articles
Video ads for premium stories

Projected: R$ 0.50-1.00 profit per user/month
```

---

## 🏗️ Architecture

### Content Sources:

```
APIs:
├─ NewsAPI (500+ sources worldwide)
├─ Guardian API (premium news)
├─ Medium API (blogs)
└─ RSS feeds (custom sources)

Categories:
├─ 🌐 World (international)
├─ 🏠 Brasil (local)
├─ 💼 Business
├─ 🏀 Sports
├─ 🎬 Entertainment
├─ 🚀 Tech
├─ 🏥 Health
└─ 🎨 Lifestyle
```

### Database Schema:

```sql
-- Articles
CREATE TABLE articles (
  id UUID PRIMARY KEY,
  title VARCHAR(255),
  content TEXT,
  source_url VARCHAR(500),
  image_url VARCHAR(500),
  category VARCHAR(50),
  published_at TIMESTAMP,
  reads_count INT DEFAULT 0,
  reward_given DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP
);

-- User Reads
CREATE TABLE user_reads (
  id UUID PRIMARY KEY,
  user_id UUID,
  article_id UUID,
  read_time INT, -- seconds
  completed BOOLEAN,
  reward DECIMAL(10,2),
  created_at TIMESTAMP
);

-- Engagement
CREATE TABLE engagements (
  id UUID PRIMARY KEY,
  user_id UUID,
  article_id UUID,
  type ENUM('like', 'love', 'angry', 'comment', 'share'),
  reward DECIMAL(10,2),
  created_at TIMESTAMP
);
```

---

## 🎮 Game Mechanics

### Reading Streaks:

```
Day 1-3: 1x multiplier
Day 4-7: 1.5x multiplier
Day 8-14: 2x multiplier
Day 15-30: 2.5x multiplier (max)

Reset if miss 1 day

Example:
Normal read: R$ 0.05
Day 7 streak: R$ 0.05 × 1.5 = R$ 0.075
Day 30 streak: R$ 0.05 × 2.5 = R$ 0.125
```

### Collections (Gamification):

```
Complete a collection = bonus reward

Collections:
├─ 📰 "News Junkie" (read 10 articles)
├─ 🌍 "World Traveler" (read from 5 continents)
├─ 💬 "Commentator" (write 5 comments)
├─ 🚀 "Tech Guru" (read 10 tech news)
├─ 🎯 "Breaking News" (read within 1 hour of publish)
└─ 🎪 "Trending Master" (read 5 trending stories)

Rewards: R$ 2.00 - R$ 10.00 per collection
```

### Leaderboards:

```
Global Rankings:
├─ 🏆 Top Readers (most reads)
├─ 💬 Top Commenters (most engagement)
├─ 📈 Top Earners (most money earned)
└─ 🔥 Trending Today (realtime engagement)

Weekly rewards:
├─ #1: R$ 50.00
├─ #2: R$ 30.00
├─ #3: R$ 20.00
├─ #4-10: R$ 5.00 each
```

---

## 📱 Mobile App (React Native)

### Screens:

```
/src/screens/
├─ auth/
│  ├─ LoginScreen
│  └─ SignupScreen
├─ news/
│  ├─ FeedScreen (article list)
│  ├─ ArticleDetailScreen (full article)
│  └─ CategoryFilterScreen
├─ engagement/
│  ├─ CommentsScreen
│  └─ ShareScreen
├─ rewards/
│  ├─ RewardsScreen (stats)
│  ├─ StreakScreen (reading streak)
│  └─ CollectionsScreen
├─ leaderboard/
│  └─ LeaderboardScreen
├─ wallet/
│  └─ WalletScreen (withdraw)
└─ profile/
   └─ ProfileScreen
```

### Components:

```
ArticleCard:
├─ Thumbnail image
├─ Headline
├─ Source + time
├─ Category badge
├─ Read time estimate
└─ Reward value (R$ 0.05)

ArticleDetail:
├─ Full image
├─ Headline + byline
├─ Content
├─ Like/Love/Angry buttons
├─ Comment section
├─ Share buttons
└─ Reading progress bar
```

---

## 🌐 Web App (Next.js)

### Pages:

```
/
├─ Landing (hero + features)
├─ /feed (main feed)
├─ /article/[id] (full article)
├─ /category/[name] (filtered by category)
├─ /leaderboard (global rankings)
├─ /rewards (user stats)
├─ /dashboard (admin)
└─ /wallet (withdraw)
```

---

## 🔄 Backend Integration (NestJS)

### New Endpoints:

```
POST   /api/news/articles          Create article
GET    /api/news/feed              Get feed
GET    /api/news/article/:id       Get single article
POST   /api/news/read              Log read
POST   /api/news/engage            Log engagement (like/comment)
GET    /api/news/leaderboard       Get rankings
GET    /api/news/collections       Get user collections
GET    /api/news/streak            Get reading streak
POST   /api/news/reward            Award points
```

### NewsService (NestJS):

```typescript
@Injectable()
export class NewsService {
  async fetchArticles(limit: number) {
    // Fetch from NewsAPI + Guardian + Medium
  }

  async logRead(userId, articleId, readTime) {
    // Calculate reward based on read time
    // Award money to wallet
  }

  async logEngagement(userId, articleId, type) {
    // Log like/comment/share
    // Award money based on type
  }

  async getLeaderboard(timeframe: 'day' | 'week' | 'month') {
    // Return top users by reads/engagement
  }

  async getReadingStreak(userId) {
    // Calculate consecutive reading days
  }
}
```

---

## 💰 Revenue Projections

### Per User Metrics:

```
Daily:
├─ Avg user reads: 5 articles
├─ Reward per read: R$ 0.05
├─ Engagement reward: R$ 0.10
├─ Daily earnings: R$ 0.35/user
└─ Daily cost to platform: R$ 0.17 (50% user take)

Monthly:
├─ User earnings: R$ 10.50
├─ Platform cost: R$ 5.25
├─ Net revenue (after ads): R$ 3.00
└─ ARPU: R$ 3.00

Yearly:
├─ User earnings: R$ 126.00
├─ Platform revenue: R$ 36.00
└─ With 1M users: R$ 36M/year
```

### Scaling:

```
10K users:    R$ 360K/year
100K users:   R$ 3.6M/year
500K users:   R$ 18M/year
1M users:     R$ 36M/year
```

---

## 🎯 Launch Timeline

```
Week 1: Setup
├─ NewsAPI integration
├─ Database design
└─ Backend setup

Week 2: Mobile
├─ React Native screens
├─ Reward calculations
└─ Wallet integration

Week 3: Web
├─ Landing page
├─ Feed UI
└─ Admin dashboard

Week 4: Testing + Launch
├─ Load testing
├─ Security audit
└─ Soft launch
```

---

## 🚀 Marketing Angles

### User Acquisition:

```
"Get Paid to Read News"
├─ Influencer campaign
├─ Content creators
├─ News aggregator partnerships
├─ Reddit/Forum communities
└─ Organic viral (share rewards)

CAC Target: R$ 5.00 (cost to acquire user)
LTV Target: R$ 50.00 (lifetime value)
LTV/CAC: 10x ✅
```

### Growth Mechanics:

```
Referral Program:
├─ Refer friend: +R$ 2.00
├─ Friend signs up: +R$ 1.00
├─ Unlimited referrals
└─ 20% take-back from friend's earnings

Viral Loop:
├─ Share article → code in URL
├─ Friend clicks → 5% discount on first withdrawal
└─ Both get R$ 0.50 bonus
```

---

## 🎨 Branding

### Colors:

```
Primary: #2563eb (Blue - news/trust)
Secondary: #1e40af (Dark blue)
Accent: #10b981 (Green - money)
Background: #0f172a (Dark navy)
Text: #f1f5f9 (Light)
```

### Logo:

```
📰💰 ONNEWS
Slogan: "Read. Earn. Repeat."
```

---

## ✅ Checklist

```
Backend:
☐ NewsAPI integration
☐ Article scraper
☐ Reward calculation engine
☐ Leaderboard system
☐ Engagement tracking

Frontend (Mobile):
☐ Feed screen
☐ Article detail
☐ Comments section
☐ Reading streak display
☐ Collections progress

Frontend (Web):
☐ Landing page
☐ Feed
☐ Article detail
☐ Leaderboards
☐ Admin dashboard

Monetization:
☐ Stripe integration
☐ Withdrawal flow
☐ AdMob/AdSense setup
☐ Transaction logging

Marketing:
☐ Landing page copy
☐ App store listings
☐ Influencer partnerships
☐ Reddit communities
```

---

## 🎪 Competitive Advantage

vs Competitors:

```
Brave Browser: Shares ad revenue, R$ 0-1/month
────────────────────────────────────
ONNEWS: R$ 10-100/month (reading + engagement)
        + Easier onboarding
        + Native apps (iOS/Android)
        + Gamification (streaks, collections)
        + Integration with OnGame ecosystem
```

---

**Status: READY TO BUILD** 🚀

Integra com OnGame Ecosystem:
- Mesma wallet/auth
- Cross-promotion (News → Games, Games → News)
- Shared leaderboards option
- Combined earning potential

