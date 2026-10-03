# OnNews API - Backend Service

NestJS REST API for ONNEWS TV Streaming Platform

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- npm 9+

### Installation

```bash
cd api-onnews
npm install
```

### Configuration

```bash
# Copy environment variables
cp .env.example .env.local

# Edit .env.local with your configuration
nano .env.local
```

### Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# View database (optional)
npx prisma studio
```

### Development

```bash
# Start development server with hot reload
npm run start:dev

# Server runs on http://localhost:3001
# Swagger docs on http://localhost:3001/docs
```

### Production

```bash
# Build
npm run build

# Start
npm run start:prod
```

---

## 📚 API Documentation

### Swagger UI
Access documentation at `http://localhost:3001/docs`

### Endpoints

#### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user

#### Users
- `GET /users/profile` - Get user profile
- `PATCH /users/profile` - Update profile

#### Wallet
- `GET /wallet` - Get wallet balance
- `GET /wallet/transactions` - Get transaction history

#### Streams
- `GET /streams/current` - Get current live stream
- `GET /streams/schedule` - Get upcoming streams
- `POST /streams/watch/start` - Start watching
- `POST /streams/watch/end/:sessionId` - Stop watching
- `GET /streams/stats` - Get user watch statistics

#### Quotes
- `GET /quotes` - Get all quotes
- `GET /quotes/:symbol/history` - Get quote history

#### Trading
- `GET /trading/account` - Get trading account
- `POST /trading/predict` - Make prediction
- `GET /trading/predictions` - Get user predictions

#### Leaderboard
- `GET /leaderboard` - Get leaderboard
- `GET /leaderboard/rank` - Get user rank

#### Notifications
- `GET /notifications` - Get notifications
- `PATCH /notifications/:id/read` - Mark as read

#### Streamers
- `GET /streamers/:id` - Get streamer info
- `POST /streamers/:id/follow` - Follow streamer
- `GET /streamers/:id/followers` - Get followers

---

## 🏗️ Project Structure

```
api-onnews/
├── src/
│   ├── modules/
│   │   ├── auth/          # Authentication
│   │   ├── users/         # User management
│   │   ├── wallet/        # Wallet & transactions
│   │   ├── streams/       # TV streaming
│   │   ├── quotes/        # Financial quotes
│   │   ├── trading/       # Trading simulator
│   │   ├── leaderboard/   # Rankings
│   │   ├── notifications/ # User notifications
│   │   └── streamers/     # Streamer management
│   ├── common/
│   │   ├── services/      # Shared services
│   │   ├── strategies/    # Auth strategies
│   │   └── guards/        # Auth guards
│   ├── app.module.ts      # Root module
│   └── main.ts            # Entry point
├── test/                  # E2E tests
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🔐 Authentication

All protected endpoints require JWT token in header:

```bash
Authorization: Bearer <jwt_token>
```

### Token Structure

```typescript
{
  sub: userId,
  email: userEmail,
  username: username,
  iat: timestamp,
  exp: timestamp
}
```

---

## 🗄️ Database

Using Prisma ORM with PostgreSQL

### Schema Location
- Prisma schema: `../database/schemas/prisma.schema`
- PostgreSQL schema: `../database/schemas/onnews.sql`

### Key Tables
- `users` - User accounts
- `wallet` - User balances
- `transactions` - Transaction history
- `streams` - TV streams
- `watching_sessions` - Watch history
- `quotes` - Financial data
- `trading_accounts` - Trading simulator
- `leaderboard_entries` - Rankings

---

## 🧪 Testing

```bash
# Run unit tests
npm test

# Watch mode
npm test:watch

# Coverage
npm test:cov

# E2E tests
npm run test:e2e
```

---

## 🔧 Configuration

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| DATABASE_URL | PostgreSQL connection | postgresql://user:pass@localhost/db |
| PORT | Server port | 3001 |
| JWT_SECRET | JWT signing key | your-secret-key |
| CORS_ORIGIN | Allowed origins | http://localhost:3000 |
| CEP_API_PROVIDER | CEP API | viacep |
| BRASIL_IO_API_KEY | CNPJ verification key | your-api-key |

---

## 📦 Dependencies

### Core
- `@nestjs/common` - NestJS framework
- `@nestjs/jwt` - JWT authentication
- `@prisma/client` - Database ORM

### Authentication
- `passport` - Authentication middleware
- `passport-jwt` - JWT strategy
- `bcrypt` - Password hashing

### API
- `@nestjs/swagger` - API documentation
- `class-validator` - Data validation
- `axios` - HTTP client

---

## 🚨 Error Handling

All errors return consistent JSON format:

```json
{
  "statusCode": 400,
  "message": "Error message",
  "error": "Bad Request"
}
```

---

## 📊 Logging

Logs are structured and printed to console in development:

```
✅ Database connected
✅ OnNews API running on http://localhost:3001
📚 Swagger docs: http://localhost:3001/docs
```

---

## 🔄 CI/CD

### GitHub Actions
- Run on push to `claude/zealous-edison-cv62ld`
- Run tests
- Build Docker image
- Deploy to staging

---

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Run tests: `npm test`
4. Commit with clear message
5. Push and create PR

---

## 📝 API Rate Limits

- Login: 5 requests/15 minutes
- API calls: 100 requests/minute
- Game start: 5 per hour

---

## 🎯 Next Steps

- [ ] Implement CEP/CNPJ integration services
- [ ] Add WebSocket for real-time updates
- [ ] Implement quote update scheduler
- [ ] Add email notifications
- [ ] Setup monitoring/logging

---

**Status**: ✅ Ready for Development
**Version**: 1.0.0
**Last Updated**: 2026-10-03
