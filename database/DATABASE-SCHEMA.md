# OnNews Database Schema Documentation

## 📋 Overview

Complete PostgreSQL schema for ONNEWS TV streaming platform. The database is organized into 10 main functional areas with 30+ tables and comprehensive indexing for optimal performance.

**Database**: PostgreSQL 15+
**Schema Name**: `onnews`
**Total Tables**: 30
**Total Indexes**: 40+

---

## 🗂️ Tables by Category

### 1. Users & Authentication (2 tables)

#### `users`
Core user account information with personal and verification details.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY |
| email | VARCHAR(255) | UNIQUE NOT NULL |
| username | VARCHAR(100) | UNIQUE NOT NULL |
| password_hash | VARCHAR(255) | NOT NULL |
| phone | VARCHAR(20) | - |
| date_of_birth | DATE | - |
| cpf | VARCHAR(14) | UNIQUE (Brazilian Tax ID) |
| state | VARCHAR(2) | - |
| city | VARCHAR(100) | - |
| profile_picture_url | TEXT | - |
| bio | TEXT | - |
| is_verified | BOOLEAN | DEFAULT false |
| is_active | BOOLEAN | DEFAULT true |
| last_login | TIMESTAMP | - |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | AUTO UPDATE |

**Key Points:**
- CPF field for Brazilian user identification
- State/City for regional features
- Verification tracking for streamer accounts
- Last login for analytics

#### `sessions`
User authentication sessions with token management.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY |
| user_id | UUID | FOREIGN KEY (users) |
| token | VARCHAR(500) | UNIQUE NOT NULL (JWT) |
| refresh_token | VARCHAR(500) | - |
| ip_address | INET | - |
| user_agent | TEXT | - |
| expires_at | TIMESTAMP | NOT NULL |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

**Key Points:**
- JWT token storage for authentication
- Refresh token for extending sessions
- IP tracking for security audit
- Automatic expiration handling

---

### 2. Wallet & Transactions (3 tables)

#### `wallet`
User account balance and earnings tracking.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY |
| user_id | UUID | UNIQUE FOREIGN KEY (users) |
| balance | DECIMAL(15,2) | DEFAULT 0.00 (R$) |
| total_earned | DECIMAL(15,2) | DEFAULT 0.00 |
| total_withdrawn | DECIMAL(15,2) | DEFAULT 0.00 |
| currency | VARCHAR(3) | DEFAULT 'BRL' |
| last_updated | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

**Key Points:**
- One wallet per user
- Balance in Brazilian Real (R$)
- Tracks total earned vs withdrawn
- Supports multiple currencies (future expansion)

**Earning Sources:**
- Watch time: R$ 0.01/minute
- Trading correct prediction: R$ 0.50
- Micro-learning videos: R$ 0.05-0.10
- Marketplace sales: R$ 2-5
- Achievements: Variable

#### `transactions`
Complete transaction history for audit trail and analytics.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY |
| user_id | UUID | FOREIGN KEY (users) |
| wallet_id | UUID | FOREIGN KEY (wallet) |
| type | VARCHAR(50) | 'watch_earning', 'trading_earning', 'withdrawal', 'purchase', 'refund' |
| amount | DECIMAL(15,2) | Transaction value |
| description | TEXT | - |
| reference_id | UUID | Links to watching_session, trading_prediction, etc. |
| status | VARCHAR(20) | 'pending', 'completed', 'failed' |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | AUTO UPDATE |

**Key Points:**
- Immutable transaction log
- Links to source (watching_session, trading_prediction)
- Status tracking for pending/failed transactions
- Indexes on user_id, type, created_at for analytics

#### `withdrawal_requests`
Withdrawal processing and bank transfer management.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY |
| user_id | UUID | FOREIGN KEY (users) |
| wallet_id | UUID | FOREIGN KEY (wallet) |
| amount | DECIMAL(15,2) | Withdrawal amount |
| bank_account_id | UUID | Bank account reference |
| status | VARCHAR(20) | 'pending', 'processing', 'completed', 'failed' |
| request_date | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |
| processed_date | TIMESTAMP | When completed |
| notes | TEXT | Admin notes |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

**Key Points:**
- Minimum withdrawal: R$ 5.00
- Maximum withdrawal: R$ 100,000
- Rate limit: 5 withdrawals/day
- Status tracking for compliance

---

### 3. TV Streaming (2 tables)

#### `streams`
Active and scheduled TV streams.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY |
| title | VARCHAR(255) | NOT NULL |
| description | TEXT | - |
| thumbnail_url | TEXT | Preview image |
| category | VARCHAR(50) | 'finance', 'news', 'trading', 'tutorial' |
| rtmp_url | VARCHAR(500) | OBS RTMP input |
| hls_url | VARCHAR(500) | HLS streaming output |
| is_live | BOOLEAN | DEFAULT false |
| reward_per_minute | DECIMAL(10,4) | Earning rate (default 0.01) |
| viewer_count | INT | Current viewers |
| scheduled_start | TIMESTAMP | - |
| scheduled_end | TIMESTAMP | - |
| actual_start | TIMESTAMP | When stream started |
| actual_end | TIMESTAMP | When stream ended |
| duration_minutes | INT | Total duration |
| total_earnings_distributed | DECIMAL(15,2) | Total paid to viewers |
| total_viewers | INT | Unique viewers |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | AUTO UPDATE |

**Key Points:**
- Schedule support for advance planning
- Real-time viewer count
- Earnings distribution tracking
- Multiple reward tiers possible
- Indexed on is_live, category for quick queries

#### `watching_sessions`
Individual user watching sessions with earnings calculation.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY |
| user_id | UUID | FOREIGN KEY (users) |
| stream_id | UUID | FOREIGN KEY (streams) |
| start_time | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |
| end_time | TIMESTAMP | Nullable (in progress) |
| duration_minutes | DECIMAL(10,2) | Calculated on completion |
| earnings | DECIMAL(15,2) | = duration_minutes × reward_per_minute |
| is_completed | BOOLEAN | DEFAULT false |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

**Key Points:**
- Real-time session tracking
- Earnings calculated on session end
- Multiple concurrent sessions allowed
- Automatic wallet credit on completion
- Indexed for user history queries

**Earning Calculation:**
```
earnings = duration_minutes × stream.reward_per_minute
wallet.balance += earnings
transaction created with type='watch_earning'
```

---

### 4. Real-Time Quotations (2 tables)

#### `quotes`
Current financial quotes with real-time updates.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY |
| symbol | VARCHAR(50) | UNIQUE (IBOV, USDBRL, BTC, etc) |
| name | VARCHAR(255) | Display name |
| price | DECIMAL(15,4) | Current price |
| previous_close | DECIMAL(15,4) | Previous day close |
| change_amount | DECIMAL(15,4) | Price change (absolute) |
| change_percent | DECIMAL(10,4) | Percentage change |
| high_day | DECIMAL(15,4) | Daily high |
| low_day | DECIMAL(15,4) | Daily low |
| volume | BIGINT | Trading volume |
| market_cap | DECIMAL(20,2) | Market capitalization |
| source | VARCHAR(50) | API source ('brapi', 'coingecko', etc) |
| last_updated | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

**Key Points:**
- Updated every 1 minute
- Supports stocks, crypto, indices
- Color coding: green for +%, red for -%
- Multiple data sources possible

**Supported Symbols:**
- IBOV - IBOVESPA Index
- USDBRL - USD/BRL Exchange Rate
- BTC - Bitcoin
- PETR4 - Petrobras
- VALE3 - Vale
- ITUB4 - Itaú

#### `quote_history`
Historical quote data for charting and analysis.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY |
| quote_id | UUID | FOREIGN KEY (quotes) |
| symbol | VARCHAR(50) | Denormalized for queries |
| price | DECIMAL(15,4) | Historical price |
| change_percent | DECIMAL(10,4) | % change at time |
| recorded_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

**Key Points:**
- Historical data every 1 minute
- Allows charting past 24h/7d/30d
- Indexed for time-series queries
- Automatic cleanup after 90 days (optional)

---

### 5. Trading Simulator (2 tables)

#### `trading_accounts`
Virtual trading account per user with R$ 10,000 simulated balance.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY |
| user_id | UUID | UNIQUE FOREIGN KEY (users) |
| initial_balance | DECIMAL(15,2) | DEFAULT 10000.00 |
| current_balance | DECIMAL(15,2) | DEFAULT 10000.00 |
| total_profit_loss | DECIMAL(15,2) | P&L calculation |
| profit_loss_percent | DECIMAL(10,4) | P&L % |
| total_trades | INT | Counter |
| winning_trades | INT | Correct predictions |
| losing_trades | INT | Incorrect predictions |
| accuracy_percent | DECIMAL(10,4) | winning_trades / total_trades |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | AUTO UPDATE |

**Key Points:**
- Each user gets R$ 10,000 simulated
- Reset available (optional feature)
- Accuracy affects achievement tracking
- Linked to real wallet for winners

#### `trading_predictions`
Individual trades with entry/exit and P&L.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY |
| user_id | UUID | FOREIGN KEY (users) |
| account_id | UUID | FOREIGN KEY (trading_accounts) |
| symbol | VARCHAR(50) | Quote symbol |
| prediction | VARCHAR(10) | 'up' or 'down' |
| entry_price | DECIMAL(15,4) | Entry price |
| quantity | INT | Shares |
| stake_amount | DECIMAL(15,2) | Simulated money risked |
| expected_earning | DECIMAL(15,2) | R$ 0.50 if correct |
| is_correct | BOOLEAN | Result |
| exit_price | DECIMAL(15,4) | Exit price (null if open) |
| profit_loss | DECIMAL(15,2) | P&L calculation |
| status | VARCHAR(20) | 'open', 'closed', 'expired' |
| time_frame | VARCHAR(50) | '1m', '5m', '15m', '1h', '1d' |
| result_time | TIMESTAMP | When result determined |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |
| closed_at | TIMESTAMP | When trade closed |

**Key Points:**
- Time frames: 1m to 1d
- Earnings: R$ 0.50 per correct prediction
- Comparison: entry_price vs quote.price at result_time
- Status auto-updated by scheduler

**Earnings:**
```
IF is_correct == true:
  wallet.balance += 0.50
  transaction created with type='trading_earning'
```

---

### 6. Streamer Management (2 tables)

#### `streamers`
Streamer profile and statistics.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY |
| user_id | UUID | UNIQUE FOREIGN KEY (users) |
| streamer_name | VARCHAR(255) | Display name |
| bio | TEXT | Streamer bio |
| profile_image_url | TEXT | Profile picture |
| banner_image_url | TEXT | Banner/header |
| is_verified | BOOLEAN | Verified badge |
| verification_date | TIMESTAMP | When verified |
| followers_count | INT | Real-time follower count |
| total_streams | INT | Lifetime streams |
| total_viewers | INT | Lifetime viewers |
| total_earnings | DECIMAL(15,2) | From streaming |
| stream_key | VARCHAR(255) | UNIQUE for OBS |
| is_active | BOOLEAN | Can stream |
| suspended_until | TIMESTAMP | Ban until date |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | AUTO UPDATE |

**Key Points:**
- Streamer onboarding workflow
- Stream key for OBS authentication
- Suspension system for violations
- Earnings tracking per streamer

#### `streamer_followers`
Follow relationships between users and streamers.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY |
| user_id | UUID | FOREIGN KEY (users) |
| streamer_id | UUID | FOREIGN KEY (streamers) |
| followed_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

**Key Points:**
- Unique constraint on (user_id, streamer_id)
- Updates streamer.followers_count
- Notification when streamer goes live

---

### 7. Achievements & Gamification (2 tables)

#### `achievements`
Achievement definitions with reward amounts.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY |
| code | VARCHAR(100) | UNIQUE (first_watch, hour_marathoner, etc) |
| name | VARCHAR(255) | Display name |
| description | TEXT | How to earn |
| icon_url | TEXT | Achievement icon |
| requirement_type | VARCHAR(50) | 'watch_hours', 'earnings', 'trades', 'accuracy' |
| requirement_value | INT | Threshold (10 hours, 100 earnings, etc) |
| reward_amount | DECIMAL(15,2) | Bonus on unlock (optional) |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

**Predefined Achievements:**
- first_watch: Assista 1 hora → R$ 5.00
- hour_marathoner: Assista 10 horas → R$ 20.00
- trader_starter: Faça 1 previsão → R$ 2.00
- accuracy_master: 80% acurácia → R$ 50.00
- top_10_earner: R$ 1000 earned → R$ 100.00

#### `user_achievements`
Achievement unlock history.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY |
| user_id | UUID | FOREIGN KEY (users) |
| achievement_id | UUID | FOREIGN KEY (achievements) |
| earned_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

**Key Points:**
- Unique per user per achievement
- Triggers notification
- May trigger bonus transaction
- Contributes to profile badges

---

### 8. Leaderboards (1 table)

#### `leaderboard_entries`
Cached leaderboard rankings (refreshed hourly).

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY |
| user_id | UUID | FOREIGN KEY (users) |
| username | VARCHAR(100) | Denormalized for display |
| rank | INT | Position (1=top) |
| total_earnings | DECIMAL(15,2) | Sum of wallet earnings |
| watch_hours | DECIMAL(10,2) | Total watch time |
| trading_accuracy | DECIMAL(10,4) | Trading win % |
| period | VARCHAR(20) | 'daily', 'weekly', 'monthly', 'all_time' |
| updated_at | TIMESTAMP | Refresh time |

**Key Points:**
- Separate entries per time period
- Indexed on period + rank for fast queries
- Refreshed hourly via scheduled job
- Shows top 100 per period

**Ranking Formula:**
```
rank = ORDER BY total_earnings DESC
```

---

### 9. Analytics & Logs (2 tables)

#### `user_analytics`
Aggregated user engagement metrics.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY |
| user_id | UUID | UNIQUE FOREIGN KEY (users) |
| total_watch_time_minutes | DECIMAL(10,2) | Sum of all sessions |
| total_earnings | DECIMAL(15,2) | Wallet balance |
| average_session_duration | DECIMAL(10,2) | Avg minutes per session |
| favorite_category | VARCHAR(50) | Most watched category |
| last_activity | TIMESTAMP | Last login/action |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | AUTO UPDATE |

**Key Points:**
- Updated on each session end
- Used for personalization
- Analytics dashboard data

#### `activity_logs`
Complete audit trail of all user actions.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY |
| user_id | UUID | NULLABLE FOREIGN KEY (users) |
| action | VARCHAR(100) | 'watch_start', 'withdraw', 'trade', etc |
| resource_type | VARCHAR(50) | 'stream', 'wallet', 'trading', 'account' |
| resource_id | UUID | What was accessed |
| details | JSONB | Flexible action data |
| ip_address | INET | Source IP |
| user_agent | TEXT | Browser/app info |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

**Key Points:**
- Immutable audit trail
- JSONB for flexible data
- Indexed for compliance queries
- Retention: 90 days standard

---

### 10. Notifications (1 table)

#### `notifications`
In-app notifications to users.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY |
| user_id | UUID | FOREIGN KEY (users) |
| type | VARCHAR(50) | 'earning', 'stream_live', 'achievement', 'trading', 'system' |
| title | VARCHAR(255) | Notification title |
| message | TEXT | Detailed message |
| action_url | TEXT | Deep link (optional) |
| is_read | BOOLEAN | DEFAULT false |
| read_at | TIMESTAMP | When read |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

**Key Points:**
- Indexed on (user_id, is_read) for unread count
- Supports deep linking to features
- 30-day retention standard
- Push notification integration optional

---

## 🔍 Key Indexes

### Performance Indexes

```sql
-- Fast user lookups
idx_users_email
idx_users_username

-- Session management
idx_sessions_user_id
idx_sessions_token

-- Real-time queries
idx_streams_is_live
idx_watching_sessions_is_completed

-- Analytics
idx_transactions_created_at DESC
idx_activity_logs_created_at DESC
idx_quote_history_recorded_at DESC

-- Trading
idx_trading_predictions_status
idx_trading_predictions_symbol

-- Leaderboard
idx_leaderboard_entries_period
idx_leaderboard_entries_rank
```

---

## 📊 Data Relationships

```
User
├── Session (1:many)
├── Wallet (1:1)
│   └── Transaction (1:many)
│   └── WithdrawalRequest (1:many)
├── WatchingSession (1:many)
│   └── Stream (many:1)
├── TradingAccount (1:1)
│   └── TradingPrediction (1:many)
│       └── Quote (many:1)
├── Streamer (1:1)
│   └── StreamerFollower (1:many)
├── UserAchievement (1:many)
│   └── Achievement (many:1)
├── UserAnalytics (1:1)
└── ActivityLog (1:many)
```

---

## 🚀 Database Setup

### Create Schema & Tables

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE onnews_db;

# Connect to database
\c onnews_db

# Run schema
\i database/schemas/onnews.sql

# Verify
\dt onnews.*  # List tables
\di onnews.*  # List indexes
```

### With Prisma

```bash
# Copy schema
cp database/schemas/prisma.schema prisma/schema.prisma

# Set DATABASE_URL environment variable
export DATABASE_URL="postgresql://user:password@localhost:5432/onnews_db"

# Run migrations
npx prisma migrate dev --name initial

# Generate Prisma client
npx prisma generate
```

---

## 📈 Performance Optimization

### Connection Pooling

```env
DATABASE_POOL_MIN=5
DATABASE_POOL_MAX=20
```

### Query Optimization

- **Watching sessions**: Index on user_id for quick user history
- **Transactions**: Index on type for earnings reports
- **Leaderboard**: Pre-calculated, refreshed hourly
- **Quotes**: In-memory cache updates every minute

### Archival Strategy

- Transactions: Keep all (immutable)
- Activity logs: Archive after 90 days
- Quote history: Archive after 30 days
- Sessions: Delete after 30 days inactive

---

## 🔐 Security

- All personal data encrypted at rest
- PII fields: email, cpf, phone
- Audit trail: activity_logs (immutable)
- GDPR: Users can request data export
- LGPD: Users can request deletion

---

## 📝 Maintenance

### Regular Tasks

- **Daily**: Backup database
- **Hourly**: Update quotes, refresh leaderboard
- **Weekly**: Archive old activity logs
- **Monthly**: Index optimization, statistics update

### Monitoring Alerts

- **Disk space**: > 80% usage
- **Connection pool**: > 15/20 active
- **Query time**: > 1 second p99
- **Error rate**: > 1% transactions failed

---

**Last Updated**: 2026-10-03
**Schema Version**: 1.0
**Status**: ✅ Ready for Development
