# ONNEWS TV Integration Guide

## 📺 Overview

ONNEWS TV is now integrated into the OnGame platform as a new module. Users can watch live streaming content and earn real money (R$) based on watch time.

## 🏗️ Architecture

### Backend (NestJS)
- **Location**: `src/modules/tv/`
- **Service**: `TVService` - Core business logic
- **Controller**: `TVController` - REST API endpoints
- **Module**: `TVModule` - NestJS module configuration

### Frontend (React Native)
- **TV Screen**: `mobile-app/src/screens/tv/TVScreen.tsx`
- **Navigation**: `mobile-app/src/navigation/BottomTabs.tsx`
- **HLS Player**: `mobile-app/src/components/HLSPlayer.tsx`

### Database
- Tables: `tv_streams`, `watching_sessions`, `quotes`
- Initialization: `scripts/init-tv-database.sql`

## 🚀 API Endpoints

### Get Current Stream
```
GET /api/tv/stream
Response: { id, title, description, reward_per_min, is_live }
```

### Get TV Schedule
```
GET /api/tv/schedule
Response: [{ id, title, startTime, endTime }]
```

### Start Watching
```
POST /api/tv/watch/start
Body: { stream_id }
Response: { id, user_id, stream_id, start_time }
```

### End Watching & Earn
```
POST /api/tv/watch/end/:sessionId
Response: { id, earnings, duration_minutes }
```

### Get Real-time Quotes
```
GET /api/tv/quotes
Response: [{ symbol, price, change_percent, updated_at }]
```

### Get User TV Statistics
```
GET /api/tv/stats
Response: { total_earnings, total_minutes_watched, current_session }
```

### Get TV Leaderboard
```
GET /api/tv/leaderboard?limit=20
Response: [{ user_id, username, total_earnings, rank }]
```

## 💰 Earning Mechanics

### Watch Time Earnings
- Base rate: **R$ 0.01 per minute**
- Premium streams: **Up to R$ 0.02 per minute**
- Calculated in real-time as user watches

### Transaction Flow
1. User starts watching via `/api/tv/watch/start`
2. Session is created and tracked
3. User stops watching via `/api/tv/watch/end/:sessionId`
4. Backend calculates: `earnings = minutes_watched × reward_per_min`
5. Earnings added to user wallet automatically
6. Transaction logged for audit trail

### Session Data
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "stream_id": "uuid",
  "start_time": "2026-10-03T12:00:00Z",
  "end_time": "2026-10-03T12:15:00Z",
  "earnings": 0.15
}
```

## 📱 Mobile App Integration

### Bottom Tab Navigation
The app now includes a 5-tab navigation:
1. **🎮 Games** - Existing games (ONZAP, ONLOVE, ONMAIL)
2. **🏆 Top** - Leaderboard
3. **📺 TV** - ONNEWS TV module (NEW)
4. **🛍️ Shop** - Cosmetics & items
5. **👤 Perfil** - User profile

### TV Screen Usage
```tsx
import TVScreen from '../screens/tv/TVScreen';

// TVScreen automatically:
// - Fetches current stream
// - Displays real-time quotes (IBOV, USD, BTC)
// - Manages watch sessions
// - Calculates earnings in real-time
// - Updates wallet on session end
```

### HLS Player Component
```tsx
import HLSPlayer from '../components/HLSPlayer';

<HLSPlayer 
  url="rtmp://stream.example.com/live/channel"
  title="Stream Title"
  onPlay={() => console.log('Playing')}
  onPause={() => console.log('Paused')}
/>
```

## 🔧 Configuration

### Environment Variables
```env
# Backend API
API_URL=https://api.ongame.com
TV_STREAM_URL=rtmp://stream.ongame.com/live

# OBS Streaming
OBS_RTMP_SERVER=rtmp://stream.ongame.com
OBS_STREAM_KEY=your-stream-key

# Quotations API
QUOTATIONS_UPDATE_INTERVAL=60000  # 1 minute
```

### Reward Configuration
Edit `src/modules/tv/tv.service.ts`:
```typescript
const REWARD_PER_MINUTE = 0.01;  // R$ per minute
const PREMIUM_REWARD = 0.02;      // Premium streams
```

## 📊 Real-time Quotations

### Supported Symbols
- **IBOV** - IBOVESPA Index
- **USDBRL** - USD/BRL Exchange Rate
- **BTC** - Bitcoin Price

### Update Mechanism
```typescript
// Updates every minute via scheduler
@Cron(CronExpression.EVERY_MINUTE)
async updateQuotes() {
  // Fetches from external API
  // Updates database
  // Sends to connected clients via WebSocket
}
```

## 🎬 Streaming Setup (OBS)

### Configuration
1. **Server**: `rtmp://stream.ongame.com`
2. **Stream Key**: Available in OnGame streamer dashboard
3. **Bitrate**: 2500-4000 kbps
4. **Resolution**: 1280x720 (recommended)
5. **Frame Rate**: 30fps

### HLS Output
- Format: HTTP Live Streaming
- Segment Duration: 10 seconds
- Playlist: 3 segments
- Quality: Adaptive bitrate

## 💳 Integration with OnGame Wallet

### Unified Wallet
- Single R$ wallet across all games + TV
- Earnings from TV sessions automatically credited
- Transactions visible in wallet history
- Withdrawal same as game earnings

### Leaderboard Integration
The TV earnings contribute to:
- **Global Leaderboard**: Combined score from games + TV earnings
- **TV-specific Leaderboard**: Top earners from watching
- **Monthly Rankings**: Competition-based bonuses

## 🔐 Security Considerations

### JWT Authentication
- All endpoints protected with JWT tokens
- Token required in Authorization header
- Refresh tokens for long sessions

### Rate Limiting
- API: 100 requests per minute
- Watch sessions: 5 per hour max
- Quotes update: 1 request per minute

### Data Validation
- Session duration validation
- Reward calculation verification
- User ownership validation

## 📈 Monitoring & Analytics

### Key Metrics
- Total active watchers
- Average watch duration
- Total earnings distributed
- Quote updates frequency
- Leaderboard activity

### Database Indexes
```sql
-- For performance
INDEX idx_watching_sessions_user_id
INDEX idx_watching_sessions_stream_id
INDEX idx_tv_streams_is_live
INDEX idx_quotes_symbol
```

## 🚨 Troubleshooting

### Stream Not Loading
1. Check OBS streaming status
2. Verify RTMP server connection
3. Check firewall/NAT settings
4. Validate stream URL in database

### Earnings Not Appearing
1. Verify session end was called
2. Check user wallet integration
3. Review transaction logs
4. Validate reward calculation

### Quotes Not Updating
1. Check API key configuration
2. Verify scheduler is running
3. Check network connectivity
4. Review WebSocket connections

## 📝 Database Schema

### tv_streams
```sql
id (UUID) - Primary key
title (VARCHAR) - Stream name
description (TEXT) - Details
url (VARCHAR) - RTMP URL
reward_per_min (DECIMAL) - Earnings rate
is_live (BOOLEAN) - Live status
created_at (TIMESTAMP) - Creation time
```

### watching_sessions
```sql
id (UUID) - Primary key
user_id (UUID) - User identifier
stream_id (UUID) - Stream identifier
start_time (TIMESTAMP) - Watch start
end_time (TIMESTAMP) - Watch end
earnings (DECIMAL) - Calculated earnings
```

### quotes
```sql
id (UUID) - Primary key
symbol (VARCHAR) - Quote symbol
price (DECIMAL) - Current price
change_percent (DECIMAL) - % change
updated_at (TIMESTAMP) - Last update
```

## 🎯 Next Steps

1. ✅ Backend API implemented
2. ✅ Mobile UI created
3. ⏳ Set up OBS streaming pipeline
4. ⏳ Configure streamer accounts
5. ⏳ Deploy to production
6. ⏳ Monitor initial performance

## 🤝 Support

For issues or questions:
- Backend: `src/modules/tv/`
- Frontend: `mobile-app/src/screens/tv/`
- Database: `scripts/init-tv-database.sql`

---

**Budget Status**: R$ 1.500/month
- Streamer: R$ 500/month
- Server/Database: R$ 400/month
- APIs: R$ 80/month
- WhatsApp: R$ 100/month
- Tools: R$ 70/month
- Buffer: R$ 350/month
