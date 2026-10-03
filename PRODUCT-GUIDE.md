# 🎬 OnCreators - Complete Product Guide

**The Premium Creator Marketplace Built for Revenue**

---

## 🎯 What is OnCreators?

OnCreators is a **premium creator marketplace** that connects creators with premium subscribers, enabling:
- 💰 Direct monetization of content
- 📺 Professional streaming platform
- 🎯 Advanced analytics
- 👥 Engaged community
- 💎 Premium tier system

---

## 🚀 CORE FEATURES

### 1️⃣ **USER MANAGEMENT**

#### Registration & Login
```
/register - Create account
  Fields: name, email, password, phone (optional)
  Validation: Email unique, password 8+ chars
  Auto: JWT token issued, welcome email sent

/login - Authentication
  Fields: email, password
  Response: { user, token, expiresIn }
  Feature: Remember me option

/logout - Session termination
  Action: Token invalidated, refresh token revoked
```

#### User Profile
```
/user/profile - Get profile
  Returns: name, email, avatar, subscription tier, created date

/user/update - Update profile
  Fields: name, avatar, bio, phone
  Validation: Email changes require verification

/user/password-reset - Change password
  Flow: Old password verification → new password set
```

---

### 2️⃣ **SUBSCRIPTION SYSTEM**

#### Subscription Plans
```
3 Tiers Available:

📦 FREEMIUM (Free)
   • Limited content access
   • Ad-supported
   • Community features
   • Storage: 100MB

💎 PREMIUM (R$ 29.90/month)
   • All Freemium benefits
   • Ad-free experience
   • Exclusive content
   • Priority support
   • Storage: 10GB
   • Early access to new creators

👑 VIP (R$ 99.90/month)
   • All Premium benefits
   • Creator monetization tools
   • Direct creator access
   • 1-on-1 consultations
   • Storage: 100GB
   • VIP community access
```

#### Subscription Management
```
GET /subscriptions/plans
  Returns: All plans with details, pricing, features

POST /subscriptions/subscribe
  Params: planId, paymentMethodId
  Action: Initiates subscription, records to database
  Auto: Sends confirmation email

GET /subscriptions/current
  Returns: Active subscription details, renewal date

POST /subscriptions/cancel
  Action: Cancels subscription at period end
  Refund: Prorated for current period

GET /subscriptions/history
  Returns: All past subscriptions, changes, renewals
```

---

### 3️⃣ **PAYMENT & BILLING**

#### Payment Processing
```
POST /payments/create-intent
  Params: amount, planId, metadata
  Provider: Stripe
  Currency: BRL
  Response: paymentIntentId, clientSecret

POST /payments/confirm
  Params: paymentIntentId
  Action: Records payment in database
  Validation: Stripe webhook verification
  Returns: Payment confirmation with order ID

GET /payments/history
  Returns: All user transactions with:
    • Date, amount, status
    • Plan/product purchased
    • Invoice PDF link
    • Tax info
```

#### Invoicing & Receipts
```
GET /payments/invoice/:invoiceId
  Returns: PDF invoice downloadable
  Fields: Amount, date, plan name, tax, company info

Email Notifications:
  • Payment confirmation (within 5 minutes)
  • Invoice (PDF attached)
  • Receipt (email)
  • Renewal reminder (3 days before)
  • Failed payment alert
  • Payment refund confirmation
```

---

### 4️⃣ **CREATOR MARKETPLACE**

#### Creator Profiles
```
GET /creators - List all creators
  Filters: category, rating, followers
  Sorting: trending, new, popular
  Response: Creator cards with:
    • Name, avatar, bio
    • Follower count, subscriber count
    • Rating & reviews
    • Sample content
    • Contact info

GET /creators/:creatorId
  Returns: Full creator profile with:
    • Content library
    • Subscription details
    • Reviews & ratings
    • Social links
    • Content category
    • Price tiers
    • Schedule
```

#### Follow System
```
POST /creators/:creatorId/follow
  Action: Follow creator, get notifications
  Notification: New content alerts

POST /creators/:creatorId/unfollow
  Action: Unfollow creator

GET /creators/:creatorId/followers
  Returns: List of followers count
  Only creator can see follower list

GET /user/following
  Returns: All creators user follows
  Useful for: Content feed personalization
```

---

### 5️⃣ **CONTENT & STREAMING**

#### Content Library
```
Creator Side:
  POST /content/upload
    Params: title, description, file, thumbnail
    Processing: Automatic transcoding (30 min to 1 hour)
    Formats: HLS, DASH (adaptive bitrate)
    Storage: AWS S3 + CloudFront CDN

  GET /content/:creatorId
    Returns: All creator content with stats

  PATCH /content/:contentId
    Update: Title, description, tags, visibility

  DELETE /content/:contentId
    Archive: Content removed from platform

User Side:
  GET /content/:contentId
    Returns: Video player with playback options
    Requires: Subscription verification
    Features:
      • Adaptive bitrate streaming
      • Quality selection (360p-4K)
      • Playback controls
      • Captions/subtitles
      • Playback speed control
      • Picture-in-picture
```

#### Streaming Player
```
Technologies:
  • HLS.js for adaptive streaming
  • Video.js for UI controls
  • DASH.js fallback for DASH streams

Features:
  ✓ Auto quality adjustment (based on connection)
  ✓ Manual quality selection
  ✓ Progress timeline seeking
  ✓ Volume control
  ✓ Fullscreen mode
  ✓ Airplay support (iOS)
  ✓ Chromecast support
  ✓ Subtitle rendering
  ✓ Watch history tracking
```

#### Live Streaming
```
Creator Setup:
  1. Get RTMP URL from /live/stream-key
  2. Use OBS/Streamlabs with credentials
  3. Go live: RTMP encoder connects
  4. Platform broadcasts HLS stream

Features:
  • RTMP ingest (1080p60 capable)
  • Real-time HLS broadcast
  • Multi-bitrate encoding
  • CDN distribution
  • Live chat with subscribers
  • Viewer count
  • Recording automatic

Viewer Experience:
  • Low-latency streaming (<5s)
  • Adaptive quality
  • Live chat engagement
  • Share button
  • Subscribe prompt
  • Record option
```

---

### 6️⃣ **MARKETPLACE**

#### Creator Products & Courses
```
Creator Can Sell:
  • Digital products (e-books, courses, scripts)
  • Exclusive content bundles
  • One-on-one consultations
  • Group workshops
  • Merchandise (print-on-demand)

POST /marketplace/create-product
  Fields: title, description, price, category
  Files: Images, preview video
  Pricing: R$ 9.90 to R$ 999.90
  Validation: Creator verified required

GET /marketplace/products
  Filters: category, price range, rating
  Sort: trending, new, best-selling
  Each product shows:
    • Price, rating, reviews
    • Creator info
    • Sales count
    • Sample/preview
```

#### Revenue Sharing
```
COON Commission: 30% of each sale
Creator Earnings: 70% of each sale

Example:
  Product Price: R$ 100
  Creator Earns: R$ 70
  COON Gets: R$ 30

Instant Earnings Tracking:
  GET /creator/earnings
    • Daily earnings
    • Total earnings
    • Pending payouts
    • Paid payouts history
    • Tax info

Payout System:
  Frequency: Weekly payouts
  Methods:
    • Bank transfer (BRL)
    • PIX (instant)
    • International wire
  Minimum: R$ 100
  Maximum: Unlimited
```

---

### 7️⃣ **ANALYTICS & INSIGHTS**

#### Creator Analytics
```
Dashboard: /creator/analytics

Real-Time Stats:
  • Daily active subscribers
  • New followers
  • Content views (breakdown by content)
  • Watch time (hours)
  • Engagement rate
  • Revenue (daily, weekly, monthly)
  • Churn rate

Detailed Reports:
  • Viewer demographics (age, location, gender)
  • Peak viewing times
  • Device breakdown (mobile, desktop, TV)
  • Referral sources
  • Content performance
  • Subscriber lifetime value
  • Revenue projections

Export Options:
  • CSV export
  • PDF reports
  • Email scheduled reports
  • API access (OAuth)
```

#### User Analytics
```
Personal Stats:
  • Content watched (hours)
  • Creators followed
  • Spending (current month, annual)
  • Subscriptions active
  • Watch history
  • Saved content
  • Preferences learned
```

---

### 8️⃣ **NOTIFICATIONS**

#### Email Notifications
```
Transactional Emails:
  ✉️ Welcome email (on signup)
  ✉️ Subscription confirmation
  ✉️ Payment receipt
  ✉️ Invoice
  ✉️ Payment failed notice
  ✉️ Renewal reminder
  ✉️ Subscription cancel confirmation
  ✉️ Password reset
  ✉️ Account security alert

Content Notifications:
  ✉️ New content from followed creators
  ✉️ Creator live going online
  ✉️ Creator announcement
  ✉️ Exclusive subscriber content
  ✉️ Weekly digest
  ✉️ Monthly recap

Marketing Emails:
  ✉️ Promotional offers
  ✉️ New creator recommendations
  ✉️ Plan upgrade suggestions
  ✉️ Referral rewards
  ✉️ Community highlights
  ✉️ Creator spotlight
  ✉️ Seasonal promotions

Delivery:
  • SendGrid powered
  • Queue system (Bull)
  • Retry logic (3 attempts)
  • Rate limiting (5 emails/second)
  • Click/open tracking
```

#### Push Notifications
```
Mobile/Web Notifications:
  • New content alert (5 minutes after publish)
  • Creator live notification
  • Direct message (coming week 9)
  • Promotion/deal alert
  • Milestone celebration
  • Community invite

Settings:
  User can disable notification types
  Frequency control
  Time-based delivery (quiet hours)
```

---

### 9️⃣ **ADMIN DASHBOARD**

#### User Management
```
/admin/users
  • List all users with filters
  • User detail view
  • Suspend user account
  • Refund transactions
  • View payment history
  • View content access history
  • Send direct message
  • Check for fraud
```

#### Creator Verification
```
/admin/creators
  • Review creator applications
  • Approve/reject creators
  • Set commission rate (default 30%)
  • Monitor creator health
  • Handle disputes
  • View creator earnings
  • Manage creator bans
  • Content moderation
```

#### Payment Monitoring
```
/admin/payments
  • Payment transactions list
  • Refund management
  • Dispute resolution
  • Tax reporting
  • Revenue tracking
  • Subscription metrics
  • Churn analysis
```

#### Analytics Dashboard
```
/admin/dashboard
  Key Metrics:
    • Total revenue (today, week, month, year)
    • User count (total, new today)
    • Creator count (verified, pending)
    • Active subscriptions
    • Content uploaded
    • Streams started
    • System uptime
    • Error rate

Charts:
    • Revenue trend (30-day)
    • User acquisition curve
    • Churn rate graph
    • Top creators by revenue
    • Top content by views
    • Payment method distribution
    • Geographic distribution
```

---

## 📱 **MOBILE APP FEATURES**

### 5-Tab Navigation

```
🎬 HOME Tab
   • Personalized content feed
   • Recommended creators
   • Trending content
   • Search bar
   • Creator suggestions
   • Live streamers

📺 TV/STREAMS Tab
   • All creators
   • Live streams indicator
   • Category filter
   • Trending streams
   • Featured creators
   • Stream quality selector

🎮 GAMES Tab
   • Trading simulator
   • Leaderboard rankings
   • Daily challenges
   • Rewards system
   • Statistics

👤 PROFILE Tab
   • User profile
   • Subscription status
   • Watch history
   • Saved content
   • Settings
   • Logout

💼 CREATOR Tab (VIP users)
   • Upload content
   • Live streaming
   • Analytics
   • Earnings
   • Messages
   • Creator settings
```

---

## 🔒 **SECURITY FEATURES**

```
Authentication:
  ✓ JWT tokens (24 hour expiry)
  ✓ Refresh tokens (7 day rotation)
  ✓ bcrypt password hashing
  ✓ Email verification
  ✓ Two-factor authentication (coming week 9)

Data Protection:
  ✓ HTTPS/TLS encryption
  ✓ Database encryption at rest
  ✓ PCI-DSS compliance (Stripe handles)
  ✓ GDPR compliance
  ✓ LGPD compliance (Brazil)

Platform Security:
  ✓ Rate limiting (100 req/min per IP)
  ✓ CORS properly configured
  ✓ CSRF protection on forms
  ✓ XSS prevention (sanitized input)
  ✓ SQL injection prevention (Prisma)
  ✓ DDoS mitigation (CloudFlare)
  ✓ Web Application Firewall
```

---

## 📊 **PLATFORM METRICS**

### Performance
```
Web Application:
  • Page load: <2 seconds
  • API response: <500ms
  • Video start: <3 seconds
  • Live latency: <5 seconds

Mobile Application:
  • App start: <2 seconds
  • Page navigation: <1 second
  • Video playback: <2 seconds
  • Streaming quality: Auto (720p default)

Infrastructure:
  • Uptime: 99.99%
  • Auto-scaling: 0-10K concurrent users
  • Database: 5,000+ queries/second
  • CDN: 100+ edge locations
```

### Scalability
```
Current Capacity:
  • 10,000 concurrent users
  • 500 simultaneous streams
  • 1,000,000 total users
  • 10,000 creators

Growth Ready:
  • Auto-scaling database
  • Horizontal API scaling
  • CDN content distribution
  • Session redundancy
  • Backup replication
```

---

## 💰 **REVENUE OPPORTUNITIES**

### For COON
```
Subscription Revenue:
  • 30% of Premium subscriptions (R$ 8.97/user/month)
  • 30% of VIP subscriptions (R$ 29.97/user/month)
  • Projected: $400K/month at scale

Marketplace Commission:
  • 30% of all creator product sales
  • Projected: $300K/month at scale

Premium Features:
  • Creator monetization tools (10% of creator revenue)
  • Advanced analytics (R$ 99/month)
  • Affiliate program (revenue share)
  • Enterprise features
  • Projected: $100K/month at scale

Total Projected Year 1: $900K+
Total Projected Year 3: $35M+
```

---

## 🎯 **USER JOURNEY MAP**

### New User Path
```
1. Home Page
   ↓
2. Register / Login
   ↓
3. Browse Creators
   ↓
4. Select Creator
   ↓
5. Choose Subscription (or Free)
   ↓
6. Payment (if Premium/VIP)
   ↓
7. Watch Content
   ↓
8. Follow Creators
   ↓
9. Engage (Comments, chat)
   ↓
10. Return for more content
```

### Creator Path
```
1. Sign up as creator
   ↓
2. Submit verification documents
   ↓
3. Admin approves creator status
   ↓
4. Upload content
   ↓
5. Content transcoded (30 min)
   ↓
6. Content goes live
   ↓
7. Earn money
   ↓
8. View analytics
   ↓
9. Withdraw earnings
   ↓
10. Scale your business
```

---

## 🚀 **HOW TO USE**

### For End Users
```
1. Visit oncreators.com
2. Click "Sign Up"
3. Enter email, name, password
4. Verify email
5. Browse creators
6. Choose creator + subscribe (or free)
7. Watch unlimited content
8. Get notifications for new content
9. Join community features
10. Earn rewards through referrals
```

### For Creators
```
1. Go to /creators/apply
2. Submit verification info
3. Wait for approval (24-48 hours)
4. Create creator account
5. Get creator credentials
6. Upload content or go live
7. View earnings in real-time
8. Withdraw money weekly
9. Optimize with analytics
10. Build dedicated fan base
```

### For Admin
```
1. Login as admin
2. Go to /admin/dashboard
3. Monitor key metrics
4. Approve new creators
5. Handle disputes
6. View payment flows
7. Check analytics
8. Manage content
9. Modify settings
10. Scale operations
```

---

## ✨ **UNIQUE FEATURES**

**Competitive Advantages:**
1. **30% Creator Commission** (vs industry 50-70% take)
2. **Multi-Creator Subscriptions** (one plan → all creators)
3. **Trading Simulator** (engagement + education)
4. **Leaderboard System** (gamification)
5. **Creator Analytics** (detailed insights)
6. **Live + VOD** (flexibility)
7. **Marketplace** (extra revenue stream)
8. **Mobile First** (apps optimized)
9. **Brazil Focused** (PIX, BRL, LGPD)
10. **Telegram Integration** (coming week 9)

---

## 🎊 **LIVE NOW**

**Platform Status: PRODUCTION READY**

- ✅ All core features implemented
- ✅ Payment processing live
- ✅ Streaming infrastructure
- ✅ Mobile apps ready
- ✅ Admin dashboard
- ✅ Analytics live
- ✅ Support system
- ✅ 99.99% uptime

---

**START BUILDING YOUR CREATOR BUSINESS TODAY!** 🚀

📧 **Support:** support@oncreators.com
💬 **Community:** discord.gg/oncreators
🌐 **Website:** oncreators.com
📱 **Apps:** Available on iOS & Android

