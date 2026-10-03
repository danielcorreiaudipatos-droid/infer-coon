# 🚀 OnCreators - Premium Creator Marketplace

Part of the **COON Ecosystem** - a complete social platform for financial education and trading.

## 📊 What is OnCreators?

A subscription-based content platform where financial experts share:
- 📺 Live streams & video analysis
- 📊 Trading signals & alerts
- 📚 Educational courses
- 💬 Private communities
- 📈 Portfolio templates
- 🎯 Market predictions

## 💰 Revenue Model

| Tier | Price | COON Commission |
|------|-------|-----------------|
| 📱 Freemium | Free | Ads (R$ 0.50-2/user/mo) |
| ⭐ Premium | R$ 29.90/mo | R$ 8.97 |
| 👑 VIP | R$ 99.90/mo | R$ 29.97 |
| 🛍️ Marketplace | Variable | 30% of all sales |

**Year 1 Target:** R$ 900K revenue (10K users)
**Year 3 Target:** R$ 35M revenue (200K users)

## 🏗️ Architecture

```
OnCreators API (NestJS)
├── 🔐 Auth Module (JWT + Passport)
├── 👥 Creators Module (Verification, Analytics)
├── 📅 Subscriptions Module (Plans, Billing Cycles)
├── 💳 Payments Module (Stripe, PIX, PayPal)
├── 🎬 Content Module (Video, PDF, Courses)
├── 🛍️ Marketplace Module (Products, Purchases)
└── 📊 Analytics Module (Real-time Reports)

PostgreSQL Database (30+ Tables)
├── Users & Auth
├── Creator Profiles
├── Subscription Plans
├── Payments & Invoices
├── Content Library
├── Marketplace Products
├── Creator Earnings
└── Analytics & Tracking
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL (via Docker)

### Installation

```bash
# 1. Clone and navigate
git clone https://github.com/danielcorreiaudipatos-droid/infer-coon.git
cd infer-coon/oncreators

# 2. Run setup
bash QUICK-START.sh

# 3. Start development
npm run dev

# 4. Visit
http://localhost:3333/docs
```

### Or Manual Setup

```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cp .env.example .env

# 3. Start database
docker-compose up -d

# 4. Setup database
npx prisma migrate dev

# 5. Start server
npm run dev
```

## 🌐 API Endpoints

### Authentication
```
POST   /auth/register          - Register user
POST   /auth/login             - Login user
POST   /auth/refresh           - Refresh JWT token
POST   /auth/logout            - Logout user
GET    /auth/me                - Get current user
```

### Creators
```
GET    /creators               - List all creators
GET    /creators/:id           - Get creator details
POST   /creators               - Create creator profile (authenticated)
PUT    /creators/:id           - Update creator profile
POST   /creators/:id/follow    - Follow creator
POST   /creators/:id/unfollow  - Unfollow creator
GET    /creators/:id/stats     - Get creator stats
```

### Subscriptions
```
GET    /subscriptions/plans    - List subscription plans
POST   /subscriptions          - Subscribe to plan
GET    /subscriptions/me       - Get my subscription
PUT    /subscriptions/:id      - Update subscription
DELETE /subscriptions/:id      - Cancel subscription
```

### Payments
```
POST   /payments/methods       - Add payment method
GET    /payments/methods       - List payment methods
POST   /payments/invoice       - Get invoice
POST   /payments/webhook       - Stripe webhook (internal)
GET    /invoices               - List my invoices
```

### Content
```
GET    /content                - List all content
GET    /content/:id            - Get content details
POST   /content                - Create content (creator)
PUT    /content/:id            - Update content
DELETE /content/:id            - Delete content
POST   /content/:id/access     - Track access
GET    /content/:id/access     - Check if user has access
```

### Marketplace
```
GET    /marketplace            - Browse products
GET    /marketplace/:id        - Get product details
POST   /marketplace            - Create product (creator)
POST   /marketplace/:id/purchase - Buy product
GET    /marketplace/purchases  - My purchases
GET    /marketplace/sales      - My sales (creator)
```

### Analytics
```
GET    /analytics/me           - My analytics
GET    /analytics/creator/:id  - Creator analytics
GET    /analytics/dashboard    - Dashboard data
```

### Health
```
GET    /health                 - Server health check
```

## 🗄️ Database Schema

### Users
- User profiles with email verification
- Profile pictures and bio
- Account status management

### Creators
- Creator profiles with verification badge
- Stripe account integration
- Earnings tracking
- Follower counts

### Subscriptions
- Multiple subscription tiers
- Trial periods support
- Auto-renewal management
- Billing cycle tracking

### Content
- Video, PDF, courses, webinars
- Preview availability
- Access tracking
- Ratings and reviews

### Marketplace
- Digital products (courses, bundles, templates)
- Purchase history
- Revenue sharing (70/30 split)
- Affiliate system

### Payments
- Multiple payment methods (card, PIX, PayPal)
- Stripe integration
- Invoice generation
- Payment history

### Analytics
- Real-time metrics
- User behavior tracking
- Creator performance
- Revenue reports

## 🛠️ Development

### Running Tests
```bash
npm test                # Run all tests
npm run test:watch     # Watch mode
npm run test:cov       # Coverage report
```

### Database Management
```bash
npx prisma studio              # Visual database editor
npx prisma migrate dev          # Create migration
npx prisma migrate reset        # Reset database
npx prisma db seed             # Seed test data
```

### Linting & Formatting
```bash
npm run lint            # Lint code
npm run format          # Format code
```

## 📦 Docker

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f postgres

# Stop services
docker-compose down

# Reset database
docker-compose down -v
```

## 🔐 Security

- ✅ JWT Authentication with Passport
- ✅ Password hashing with bcryptjs
- ✅ CORS protection
- ✅ Input validation (class-validator)
- ✅ SQL injection prevention (Prisma ORM)
- ✅ Environment variable management
- ✅ Stripe webhook verification

## 📊 Monitoring & Analytics

Dashboard includes:
- Total users and creators
- Revenue metrics
- Subscription churn rate
- Top creators
- User engagement
- Payment success rate
- Content performance

## 🚢 Deployment

### Vercel (Recommended)
```bash
vercel deploy
```

### Docker
```bash
docker build -t oncreators-api .
docker run -p 3333:3333 oncreators-api
```

### Environment Variables for Production
```
DATABASE_URL=postgresql://...
JWT_SECRET=your_secret_key
STRIPE_SECRET_KEY=sk_live_...
NODE_ENV=production
```

## 📚 Documentation

Full API documentation available at:
- `http://localhost:3333/docs` (Swagger UI)
- `http://localhost:3333/docs-json` (OpenAPI JSON)

## 🤝 Contributing

This is part of the COON ecosystem. For contributions, please follow:
1. Create feature branch
2. Make changes
3. Write/update tests
4. Submit pull request

## 📄 License

MIT License - COON Ecosystem

## 🎯 Week 1 Deliverables

**SEG-TER (Monday-Tuesday):** Database & Architecture
- ✅ Create all tables
- ✅ Setup Prisma schema
- ✅ Initialize NestJS modules

**QUA-QUI (Wednesday-Thursday):** API Endpoints
- POST /subscriptions/create
- GET /subscriptions/list
- POST /payments/webhook
- GET /creator/:id/content
- POST /ads/view

**SEX (Friday):** Integration & Testing
- ✅ Full integration tests
- ✅ Health checks
- ✅ Documentation

---

**Built with ❤️ for the COON Ecosystem**
