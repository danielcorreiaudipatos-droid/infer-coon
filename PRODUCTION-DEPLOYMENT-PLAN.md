# 🚀 PRODUCTION DEPLOYMENT PLAN

## Phase 1: Production Infrastructure Setup

### 1.1 Production Database
```bash
# PostgreSQL Production (Cloud Provider)
- AWS RDS PostgreSQL 15+
- Backup: Automated daily
- Replication: Multi-AZ
- Monitoring: CloudWatch + DataDog
```

### 1.2 Production Environment Variables
```env
# API Configuration
NEXT_PUBLIC_API_URL=https://api.ongame.com
NEXT_PUBLIC_COON_API_URL=https://api.coon.com

# Database
DATABASE_URL=postgresql://user:pass@prod-db.region.rds.amazonaws.com/ongame

# Stripe (LIVE KEYS - Not Mock)
STRIPE_SECRET_KEY=sk_live_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx

# JWT & Security
JWT_SECRET=<generate-strong-random-key>
ENCRYPTION_KEY=<generate-strong-random-key>

# Third-party Services
SENDGRID_API_KEY=sg_live_xxxxx
TWILIO_ACCOUNT_SID=xxxxx
TWILIO_AUTH_TOKEN=xxxxx

# Analytics
MIXPANEL_TOKEN=xxxxx
GOOGLE_ANALYTICS_ID=G-xxxxx
DATADOG_API_KEY=xxxxx

# Email Notifications
ADMIN_EMAIL=admin@ongame.com
SUPPORT_EMAIL=support@ongame.com
```

### 1.3 Production Domains
```
OnGame:
  - ongame.com (main)
  - www.ongame.com (www)
  - api.ongame.com (backend)
  - admin.ongame.com (admin panel)

COON:
  - coon.com (main)
  - www.coon.com (www)
  - api.coon.com (backend)
  - admin.coon.com (admin panel)
```

---

## Phase 2: Vercel Production Configuration

### 2.1 vercel-prod.json
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm ci",
  "env": {
    "NEXT_PUBLIC_API_URL": "@NEXT_PUBLIC_API_URL",
    "DATABASE_URL": "@DATABASE_URL",
    "STRIPE_SECRET_KEY": "@STRIPE_SECRET_KEY"
  },
  "regions": ["sfo1", "iad1", "hnd1"],
  "functions": {
    "api/**": {
      "maxDuration": 60,
      "memory": 3008
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains"
        }
      ]
    }
  ]
}
```

### 2.2 Custom Domains
- Register both domains on Vercel
- Configure SSL/TLS (automatic with Vercel)
- Set DNS records to Vercel

---

## Phase 3: Security Hardening

### 3.1 SSL/TLS
- ✅ Automatic via Vercel (Let's Encrypt)
- Force HTTPS on all routes
- HSTS header (1 year)

### 3.2 API Security
```typescript
// Rate Limiting Production
const RATE_LIMITS = {
  login: '5/15m',          // 5 per 15 minutes
  api: '100/1m',           // 100 per minute per IP
  game_start: '5/60m',     // 5 games per hour
  withdraw: '1/24h',       // 1 withdrawal per day
  cosmetics_buy: '20/60m'  // 20 items per hour
};

// DDoS Protection
- Cloudflare WAF
- Rate limiting by IP
- Bot detection
- Geographic blocking (optional)
```

### 3.3 Data Protection
```typescript
// Encryption
- At rest: AES-256 for sensitive data
- In transit: TLS 1.3
- Database encryption: RDS encryption enabled
- Backups: Encrypted daily

// PII Handling
- Minimal PII collection
- GDPR/LGPD compliance
- Data retention: 1 year
- Delete on request: 30 days
```

### 3.4 Payment Security
```
Stripe Integration:
- Use Stripe.js (client-side tokenization)
- Never store raw card data
- PCI-DSS compliant
- Webhook signature verification
- 3D Secure for fraud prevention
```

---

## Phase 4: Monitoring & Observability

### 4.1 Infrastructure Monitoring
```
DataDog / New Relic:
- CPU/Memory usage
- Database connection pool
- API response times
- Error rates
- Uptime monitoring (99.9% SLA)
```

### 4.2 Application Monitoring
```
Sentry / LogRocket:
- JavaScript errors
- API errors
- User sessions
- Performance metrics
- Crash reports
```

### 4.3 Business Metrics
```
Custom Analytics:
- DAU (Daily Active Users)
- ARPU (Average Revenue Per User)
- Retention rates
- Game completion rates
- Cosmetics conversion
- Withdrawal success rate
```

### 4.4 Alerting
```
PagerDuty / Opsgenie:
- Critical errors: Instant SMS
- 5xx errors: Slack notification
- High latency (>1s): Email
- Database warnings: Slack
- Payment failures: Email + SMS
```

---

## Phase 5: Database Migration & Backup

### 5.1 Production Database Setup
```sql
-- Create production database
CREATE DATABASE ongame_prod;

-- Run migrations
npx prisma migrate deploy --preview-feature

-- Seed essential data (countries, currencies)
npx prisma db seed

-- Verify schema
npx prisma studio
```

### 5.2 Backup Strategy
```
Automated Backups:
- Hourly snapshots (7 days retention)
- Daily full backups (30 days retention)
- Weekly archives (1 year retention)
- Cross-region replication

Backup Verification:
- Monthly restore tests
- Document recovery procedures
- Point-in-time recovery: 7 days
```

### 5.3 Data Migration from Staging
```bash
# Dump staging data (if needed)
pg_dump -h staging-db.com -U user staging_db > backup.sql

# Restore to production (selective)
psql -h prod-db.com -U user prod_db < backup.sql

# Or: Replicate specific records only
# (Don't copy test user data to production)
```

---

## Phase 6: Payment System Configuration

### 6.1 Stripe Production Setup
```
Account Type: Express Account
Currencies: BRL (R$)
Payment Methods:
  ✅ Credit/Debit Card (Visa, Mastercard, Elo)
  ✅ PIX (instant in Brazil)
  ✅ Bank transfer
  
Payout Schedule: Daily to bank account
Webhook Events:
  - charge.succeeded
  - charge.failed
  - account.updated
  - payout.paid
  - payout.failed
```

### 6.2 Withdrawal Integration
```typescript
// Production withdrawal flow
1. User requests withdrawal
2. Verify minimum balance (R$ 5.00)
3. Validate bank account / PIX key
4. Create Stripe payout
5. Track payout status via webhook
6. Notify user via email/SMS
7. Auto-retry failed payouts (3 attempts)
```

---

## Phase 7: Email & Communication

### 7.1 SendGrid Setup
```
Templates:
- Welcome email
- Withdrawal confirmation
- Payment failure notification
- New cosmetic alert
- Promotion/bonus announcement
- Account security alert

Sender: noreply@ongame.com
Support: support@ongame.com
```

### 7.2 SMS Notifications (Twilio)
```
Use cases:
- Withdrawal confirmation (OTP)
- Large payout notification
- Account security alerts
- Bonus/promotion alerts

Compliance:
- LGPD compliant
- Opt-out available
- Rate limit: 1 SMS per 5 minutes
```

---

## Phase 8: CDN & Performance

### 8.1 Static Assets
```
Vercel Edge Network:
- Global CDN (automatic)
- Cache busting via hash
- Compression: gzip + brotli
- Image optimization: next/image

Cloudflare (optional):
- Additional caching layer
- WAF protection
- DDoS mitigation
```

### 8.2 Performance Optimization
```
Metrics (Lighthouse):
- First Contentful Paint: <1.5s
- Largest Contentful Paint: <2.5s
- Cumulative Layout Shift: <0.1
- Time to Interactive: <3.5s

Database:
- Query optimization
- Connection pooling
- Read replicas for analytics
```

---

## Phase 9: Testing Checklist

### 9.1 Functionality Testing
```
Games:
- ☐ ONZAP plays end-to-end
- ☐ Score calculation correct
- ☐ Rewards awarded immediately
- ☐ Leaderboard updates real-time

Payments:
- ☐ Cosmetics purchase flow
- ☐ Stripe webhook processing
- ☐ Wallet balance updates
- ☐ Withdrawal request accepted
- ☐ Payout confirmation email sent

Authentication:
- ☐ Sign up works
- ☐ Login works
- ☐ Session persistence
- ☐ Logout clears session
- ☐ Password reset works
```

### 9.2 Security Testing
```
- ☐ SQL injection attempts blocked
- ☐ XSS attempts sanitized
- ☐ CSRF tokens validated
- ☐ Rate limiting enforced
- ☐ Invalid JWT rejected
- ☐ Unauth access blocked
- ☐ Admin endpoints require auth
```

### 9.3 Performance Testing
```
Load Test:
- 1,000 concurrent users
- Monitor response times
- Check database performance
- Verify no 500 errors

Stress Test:
- 10,000 concurrent users
- Identify breaking point
- Auto-scaling triggers

Soak Test:
- Run for 24 hours
- Monitor memory leaks
- Check log file growth
```

### 9.4 Browser Compatibility
```
- ☐ Chrome (latest 2)
- ☐ Firefox (latest 2)
- ☐ Safari (latest 2)
- ☐ Edge (latest 2)
- ☐ Mobile Safari (iOS 14+)
- ☐ Chrome Mobile (Android 10+)
```

---

## Phase 10: Launch Day Checklist

### Pre-Launch (24 hours before)
```
- ☐ All tests passing
- ☐ Monitoring dashboards active
- ☐ Backup verified
- ☐ Rollback plan documented
- ☐ Support team trained
- ☐ On-call schedule set
- ☐ Communication channels ready
```

### Launch (T-0)
```
- ☐ Deploy to production
- ☐ Verify all URLs accessible
- ☐ Test critical flows
- ☐ Monitor error rates
- ☐ Check performance metrics
- ☐ Announce on social media
- ☐ Send press release
```

### Post-Launch (First 24 hours)
```
- ☐ Monitor real user traffic
- ☐ Watch for errors/crashes
- ☐ Check payment processing
- ☐ Verify email notifications
- ☐ Respond to support tickets
- ☐ Daily standup at 9 AM
- ☐ Monitor competitor activity
```

---

## Phase 11: Post-Launch Operations

### 11.1 Daily Tasks
```
- Monitor uptime
- Check error logs
- Review user feedback
- Process withdrawal requests
- Verify payment processing
```

### 11.2 Weekly Tasks
```
- Review analytics
- Check security alerts
- Backup verification
- Performance analysis
- Competitor analysis
```

### 11.3 Monthly Tasks
```
- Revenue analysis
- User cohort analysis
- Feature usage metrics
- Security audit
- Database optimization
```

---

## Estimated Timeline

```
Phase 1-2: Infrastructure Setup          3 days
Phase 3-4: Security & Monitoring         3 days
Phase 5-6: Database & Payments           2 days
Phase 7-8: Communications & CDN          2 days
Phase 9:   Testing                       5 days
Phase 10:  Launch preparation            2 days
────────────────────────────────────────
TOTAL:                                   17 days
```

---

## Success Metrics (First 30 days)

```
User Acquisition:
- Target: 10,000 sign-ups
- Target: 5,000 DAU
- Target: 30% retention (Day 7)

Revenue:
- Target: R$ 50,000
- Target: R$ 5 ARPU
- Target: 10% cosmetics conversion

Technical:
- Uptime: 99.9%+
- Avg response time: <500ms
- Error rate: <0.1%
- Payment success: >99.5%
```

