# 🚀 Production Deployment Guide - OnGame + COON

**Last Updated:** 2026-10-03  
**Status:** Ready for Production  
**Estimated Duration:** 17 days (from planning to launch)

---

## QUICK START (Executive Summary)

```
Target Launch: 17 days from today
Current Status: Staging LIVE ✅ | Production Ready ⏳
Success Metrics: 10K DAU, R$ 50K revenue (Month 1)
Team Required: DevOps, Backend, QA, Support
```

---

## Prerequisites Checklist

Before deploying to production, ensure you have:

```
Infrastructure:
  ☐ AWS Account with RDS access
  ☐ Vercel Pro Account ($150/month)
  ☐ Stripe Live Account (verified)
  ☐ SendGrid Account (API key ready)
  ☐ Twilio Account (for SMS)
  ☐ DataDog Account (for monitoring)
  ☐ Sentry Account (for error tracking)
  ☐ Cloudflare Account (optional, for WAF)

Domains:
  ☐ ongame.com registered
  ☐ coon.com registered
  ☐ SSL certificates ordered
  ☐ DNS configured for Vercel
  ☐ Email domain authenticated

Credentials:
  ☐ All API keys generated
  ☐ Database passwords set (min 32 chars)
  ☐ Encryption keys generated
  ☐ JWT secrets created
  ☐ Stripe webhooks configured

Team Access:
  ☐ All developers have Vercel access
  ☐ All developers have AWS access
  ☐ Support team trained
  ☐ On-call schedule created
  ☐ Incident response plan ready
```

---

## STEP 1: AWS RDS Production Database Setup (Day 1)

### 1.1 Create RDS PostgreSQL Instance

```bash
# Via AWS Console or CLI
aws rds create-db-instance \
  --db-instance-identifier ongame-prod-db \
  --db-instance-class db.t3.medium \
  --engine postgres \
  --engine-version 15.4 \
  --master-username ongame_prod_user \
  --master-user-password "STRONG_PASSWORD_HERE" \
  --allocated-storage 100 \
  --storage-type gp3 \
  --storage-encrypted \
  --multi-az \
  --backup-retention-period 30 \
  --preferred-backup-window "02:00-03:00" \
  --preferred-maintenance-window "sun:03:00-sun:04:00" \
  --publicly-accessible false \
  --vpc-security-group-ids sg-12345678
```

### 1.2 Configure Database Security

```bash
# Create parameter group for performance
aws rds create-db-parameter-group \
  --db-parameter-group-name ongame-prod-params \
  --db-parameter-group-family postgres15 \
  --description "OnGame Production Parameters"

# Modify parameters
aws rds modify-db-parameter-group \
  --db-parameter-group-name ongame-prod-params \
  --parameters \
    ParameterName=shared_buffers,ParameterValue=262144,ApplyMethod=pending-reboot \
    ParameterName=max_connections,ParameterValue=500,ApplyMethod=immediate \
    ParameterName=log_statement,ParameterValue=all,ApplyMethod=immediate
```

### 1.3 Initialize Database Schema

```bash
# Connect to production database
psql -h ongame-prod-db.xxxxx.rds.amazonaws.com -U ongame_prod_user -d postgres

# Create database
CREATE DATABASE ongame_prod ENCODING 'UTF8' LC_COLLATE 'en_US.UTF-8' LC_CTYPE 'en_US.UTF-8';

# Create extensions
\c ongame_prod
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

# Run migrations
npx prisma migrate deploy --skip-generate

# Seed reference data
npx prisma db seed

# Verify schema
npx prisma studio
```

### 1.4 Set Up Backup Strategy

```bash
# Enable automated backups (via AWS Console)
- Backup retention: 30 days
- Backup window: 02:00-03:00 UTC
- Multi-AZ: Enabled
- Copy to different region: Enabled

# Schedule weekly verification
0 2 * * SUN  /scripts/verify-backup.sh

# Schedule monthly restore test
0 3 1 * *    /scripts/test-restore.sh
```

---

## STEP 2: Configure Vercel Production Deployment (Day 2)

### 2.1 Create Vercel Production Project

```bash
# Option A: Via Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Click "New Project"
3. Select: danielcorreiaudipatos-droid/infer-coon
4. Set root directory: ./
5. Select Next.js framework
6. Click "Deploy"

# Option B: Via Vercel CLI
vercel --prod \
  --name ongame-prod \
  --env DATABASE_URL="postgresql://..." \
  --env STRIPE_SECRET_KEY="sk_live_..." \
  --env JWT_SECRET="..." \
  --build-env=VERCEL_ENV=production
```

### 2.2 Configure Environment Variables

```bash
# In Vercel Dashboard → Settings → Environment Variables

ENVIRONMENT: Production

# Add all variables from .env.production
# Use Vercel's built-in secret manager:
1. Click "Add Environment Variable"
2. Name: NEXT_PUBLIC_API_URL
3. Value: https://api.ongame.com
4. Environments: Production
5. Repeat for all 50+ variables
```

### 2.3 Link Custom Domains

```bash
# Domain 1: ongame.com
1. Vercel Dashboard → Project → Settings → Domains
2. Click "Add Domain"
3. Enter: ongame.com
4. Add DNS records shown (CNAME + TXT)
5. Wait for verification (5-10 min)
6. Repeat for: www.ongame.com, api.ongame.com

# Domain 2: coon.com
# Repeat same process

# SSL/TLS: Automatic (Let's Encrypt)
# HSTS: Enabled by vercel-prod.json
```

### 2.4 Configure Auto-scaling

```json
{
  "serverless_function_region": "sfo1",
  "functions": {
    "api/**": {
      "maxDuration": 60,
      "memory": 3008,
      "regions": ["sfo1", "iad1", "hnd1"]
    }
  },
  "regions": ["sfo1", "iad1", "hnd1", "gru1"]
}
```

---

## STEP 3: Stripe Live Payment Setup (Day 3)

### 3.1 Stripe Account Verification

```
1. Go to https://dashboard.stripe.com
2. Complete business verification
3. Add bank account for payouts
4. Enable BRL currency
5. Request high payout limits if needed
```

### 3.2 Generate Live API Keys

```bash
# In Stripe Dashboard → Developers → API Keys
- Restricted Key (for backend): sk_live_XXXX
- Publishable Key: pk_live_XXXX
- Webhook Secret: whsec_XXXX

# Save to Vercel environment variables (encrypted)
STRIPE_SECRET_KEY=sk_live_XXXX
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_XXXX
STRIPE_WEBHOOK_SECRET=whsec_XXXX
```

### 3.3 Configure Webhook Endpoints

```bash
# In Stripe Dashboard → Developers → Webhooks

# Add new endpoint
URL: https://api.ongame.com/webhooks/stripe
Secret: Auto-generated (copy to STRIPE_WEBHOOK_SECRET)

Events to listen:
✓ charge.succeeded
✓ charge.failed
✓ charge.refunded
✓ customer.subscription.created
✓ customer.subscription.deleted
✓ account.external_account.created
✓ payout.paid
✓ payout.failed
✓ payout.canceled
```

### 3.4 Test Payment Flow

```bash
# Use Stripe test mode first
1. Open https://ongame-prod.vercel.app
2. Add test cosmetic to cart
3. Use test card: 4242 4242 4242 4242
4. Verify webhook received: https://dashboard.stripe.com/webhooks
5. Check database: wallet balance updated

# Then switch to LIVE mode
1. Change STRIPE_SECRET_KEY to live key
2. Use real card for test payment
3. Verify real payment appears in Stripe Dashboard
4. Verify withdrawal to bank account works
```

---

## STEP 4: Email & SMS Integration (Day 4)

### 4.1 SendGrid Setup

```bash
# 1. Create SendGrid API Key
https://app.sendgrid.com/settings/api_keys
- Name: OnGame Production
- Permissions: Mail Send, Template Management
- Save key to SENDGRID_API_KEY

# 2. Create Email Templates
https://mc.sendgrid.com/design/templates

Templates needed:
- Welcome Email
- Verify Email Address
- Password Reset
- Withdrawal Confirmation
- Payment Success
- Payment Failed
- New Cosmetic Alert

# 3. Set Up Sender Authentication
https://app.sendgrid.com/settings/sender_auth
- Add domain: ongame.com
- Add subdomain: mail.ongame.com
- Configure SPF, DKIM, CNAME
- Verify (wait 10-15 min)

# 4. Add to Vercel
SENDGRID_API_KEY=SG.XXX
SENDGRID_FROM_EMAIL=noreply@ongame.com
```

### 4.2 Twilio SMS Setup

```bash
# 1. Create Twilio Account
https://www.twilio.com/console

# 2. Buy Phone Number
- Select Brazil (+55)
- Type: SMS/Voice capable
- Example: +55 85 9876-5432

# 3. Generate Auth Credentials
- Account SID: ACxxxxx
- Auth Token: xxxxx
- Phone Number: +55 85 9876-5432

# 4. Add to Vercel
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=xxxxx
TWILIO_PHONE_NUMBER=+55 85 9876-5432

# 5. Enable SMS Features
- OTP for withdrawal
- Bonus notifications
- Large payout alerts
```

---

## STEP 5: Monitoring & Observability Setup (Day 5)

### 5.1 DataDog Monitoring

```bash
# 1. Create DataDog Account
https://app.datadoghq.com

# 2. Install DataDog Agent
npm install --save datadog-api-client

# 3. Configure Monitoring
DATADOG_API_KEY=xxxxx
DATADOG_SITE=datadoghq.com
DATADOG_SERVICE=ongame-api
DATADOG_ENV=production

# 4. Set Up Dashboards
- Infrastructure dashboard
- Application performance
- Business metrics
- Payment processing

# 5. Create Alerts
- CPU > 80% → Slack notification
- Memory > 90% → Slack + Email
- Response time > 1s → Email
- Error rate > 1% → SMS
- Database warnings → Slack
```

### 5.2 Sentry Error Tracking

```bash
# 1. Create Sentry Project
https://sentry.io

# 2. Generate DSN
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx

# 3. Configure Alerts
- JavaScript errors: Slack
- API errors: Email
- Performance issues: Slack
- Release health: Dashboard

# 4. Set Release Tags
git tag v1.0.0-prod
vercel deploy --prod --meta=version=1.0.0
```

### 5.3 Google Analytics 4

```bash
# 1. Create GA4 Property
https://analytics.google.com

# 2. Generate Measurement ID
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXX

# 3. Link to Stripe
Analytics → Admin → Data Streams → Settings
- Enable Stripe integration
- Track revenue events
- Monitor user funnels

# 4. Create Custom Reports
- DAU by game
- ARPU by user cohort
- Conversion funnel
- Churn rate
```

---

## STEP 6: Security Hardening (Day 6)

### 6.1 Enable HTTPS & Security Headers

```bash
# Automatic via Vercel + vercel-prod.json:
✓ HTTPS/TLS 1.3
✓ HSTS (1 year)
✓ X-Frame-Options: DENY
✓ X-Content-Type-Options: nosniff
✓ X-XSS-Protection: 1; mode=block
```

### 6.2 Configure Rate Limiting

```typescript
// src/middleware/rateLimit.ts
const RATE_LIMITS = {
  login: '5/15m',           // 5 attempts per 15 minutes
  api: '100/1m',            // 100 requests per minute per IP
  game_start: '5/60m',      // 5 games per hour
  withdraw: '1/24h',        // 1 withdrawal per day
  cosmetics_buy: '20/60m'   // 20 purchases per hour
};

// Use Redis for distributed rate limiting
// Deploy Redis on AWS ElastiCache
```

### 6.3 DDoS Protection with Cloudflare

```bash
# 1. Enable Cloudflare
https://www.cloudflare.com
- Point DNS to Cloudflare
- Enable WAF rules
- Enable rate limiting

# 2. Configure WAF Rules
- OWASP top 10 rules
- Bot management
- Rate limiting (50 req/min)
- Geographic blocking (if needed)

# 3. Enable DDoS Protection
- Basic: Free
- Advanced: $200/month
```

### 6.4 API Security

```typescript
// src/middleware/auth.ts
- Validate JWT signature
- Check token expiration
- Verify user permissions
- Check device fingerprint
- Validate checksum

// src/middleware/validation.ts
- Input sanitization (SQL injection)
- XSS prevention
- CSRF token validation
- Content-type validation
- Max request size: 10MB
```

---

## STEP 7: Database Migrations & Data Setup (Day 7)

### 7.1 Run Production Migrations

```bash
# Set production database URL
export DATABASE_URL="postgresql://ongame_prod_user:PASSWORD@ongame-prod-db.xxxxx.rds.amazonaws.com/ongame_prod"

# Run all pending migrations
npx prisma migrate deploy

# Verify schema
npx prisma studio

# Seed reference data
npx prisma db seed
```

### 7.2 Create Database Indexes

```sql
-- Performance indexes for production
CREATE INDEX CONCURRENTLY idx_games_userId_createdAt ON game_sessions(user_id, created_at);
CREATE INDEX CONCURRENTLY idx_games_gameType_status ON game_sessions(game_type, status);
CREATE INDEX CONCURRENTLY idx_leaderboard_gameType_score ON game_leaderboard(game_type, score DESC);
CREATE INDEX CONCURRENTLY idx_wallet_userId_balance ON wallet(user_id, balance);
CREATE INDEX CONCURRENTLY idx_transactions_userId_createdAt ON transactions(user_id, created_at);
CREATE INDEX CONCURRENTLY idx_cosmetics_userId_itemId ON cosmetics_owned(user_id, cosmetic_id);

-- Analyze query plans
ANALYZE;
```

### 7.3 Configure Backup Verification

```bash
# Create backup verification script
cat > /scripts/verify-backup.sh << 'EOF'
#!/bin/bash
# Test restore from backup
BACKUP_ID=$(aws rds describe-db-snapshots --db-instance-identifier ongame-prod-db --query 'DBSnapshots[0].DBSnapshotIdentifier' --output text)
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier ongame-prod-db-restore-test \
  --db-snapshot-identifier $BACKUP_ID
# Wait 10 minutes, verify connection, then delete
EOF

chmod +x /scripts/verify-backup.sh
```

---

## STEP 8: Testing & QA (Days 8-12)

### 8.1 Functional Testing Checklist

```
Games:
  ☐ ONZAP: Play, earn points, score calculation correct
  ☐ ONLOVE: Swipe mechanics, reward calculation, matches work
  ☐ ONMAIL: Tower building, waves, difficulty scaling

Payments:
  ☐ Buy cosmetic item (R$ 4.99)
  ☐ Verify Stripe charge created
  ☐ Verify wallet balance updated
  ☐ Verify email confirmation sent

Withdrawals:
  ☐ Request withdrawal (R$ 10.00)
  ☐ Verify minimum balance check
  ☐ Verify Stripe payout created
  ☐ Verify payout status webhook received
  ☐ Verify user notification sent

User Account:
  ☐ Sign up new account
  ☐ Verify email sent
  ☐ Verify user can login
  ☐ Verify profile editable
  ☐ Verify password reset works
  ☐ Verify 2FA optional setup works

Leaderboards:
  ☐ Leaderboard displays top 100 players
  ☐ User ranking correct
  ☐ Real-time updates work
  ☐ Historical data available
```

### 8.2 Load Testing

```bash
# Test with k6
npm install -g k6

# Create load test script
cat > /scripts/load-test.js << 'EOF'
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  vus: 100,  // 100 concurrent users
  duration: '5m',
  rampUp: '1m'
};

export default function() {
  let res = http.get('https://api.ongame.com/health');
  check(res, { 'status is 200': (r) => r.status === 200 });
}
EOF

# Run load test
k6 run /scripts/load-test.js
```

### 8.3 Security Testing

```bash
# Test SQL injection
curl "https://api.ongame.com/api/users?id=1' OR '1'='1"
# Should return error, not user data

# Test XSS
curl -X POST https://api.ongame.com/api/cosmetics \
  -d '{"name":"<script>alert(1)</script>"}'
# Should be escaped/sanitized

# Test rate limiting
for i in {1..10}; do
  curl -X POST https://api.ongame.com/api/login
done
# Should get rate limit error after 5 attempts in 15 min
```

### 8.4 Smoke Testing (Pre-launch)

```bash
# Create smoke test script
npm run test:smoke

# Test critical endpoints:
✓ GET /health → 200
✓ POST /api/auth/signup → 201
✓ POST /api/auth/login → 200
✓ GET /api/games/onzap → 200
✓ GET /api/cosmetics → 200
✓ GET /api/leaderboard → 200
✓ POST /api/games/onzap/start → 200
```

---

## STEP 9: Launch Preparation (Day 13)

### 9.1 Pre-Launch Checklist

```
24 Hours Before Launch:

Code & Deployment:
  ☐ All code merged to main branch
  ☐ All tests passing (100% coverage)
  ☐ No critical security issues
  ☐ Performance benchmarks met
  ☐ Database migrations verified
  ☐ Backups verified

Infrastructure:
  ☐ Vercel production deployed
  ☐ All environment variables set
  ☐ Custom domains pointing correctly
  ☐ SSL certificates valid
  ☐ CDN caching configured
  ☐ Monitoring dashboards active

Integrations:
  ☐ Stripe live account tested
  ☐ SendGrid templates verified
  ☐ Twilio SMS tested
  ☐ Email delivery tested
  ☐ Analytics tracking verified
  ☐ Error tracking (Sentry) active

Security:
  ☐ HTTPS everywhere
  ☐ Rate limiting enabled
  ☐ DDoS protection active
  ☐ WAF rules configured
  ☐ Database encrypted
  ☐ Backup encrypted

Team:
  ☐ Support team trained
  ☐ On-call schedule set
  ☐ Incident response plan ready
  ☐ Communication channels set up
  ☐ Runbooks documented
  ☐ Rollback plan documented

Marketing:
  ☐ Press release written
  ☐ Social media posts scheduled
  ☐ Email campaign ready
  ☐ Landing pages optimized
  ☐ Analytics UTM parameters set
  ☐ A/B tests planned
```

### 9.2 Rollback Plan

```bash
# If production fails, can rollback to previous version:

# Option 1: Vercel automatic rollback
- Vercel Dashboard → Deployments
- Click previous stable deployment
- Click "Promote to Production"

# Option 2: Database rollback
- AWS RDS → Restore from backup (if corruption detected)
- Point DNS to previous server

# Option 3: Full rollback
- Revert to last stable commit
- Deploy to Vercel
- Run database migration rollback
```

---

## STEP 10: Launch Day (Day 14)

### 10.1 Launch Timeline

```
08:00 - Final verification
      ☐ All systems green
      ☐ Team ready
      ☐ Support standing by

09:00 - Open to public
      ☐ Remove beta access restrictions
      ☐ Enable user registration
      ☐ Announce on social media

09:15 - Real-time monitoring
      ☐ Watch error rate
      ☐ Monitor API response times
      ☐ Check payment processing
      ☐ Verify email delivery

10:00 - First support tickets
      ☐ Response time < 1 hour
      ☐ Escalation process clear

12:00 - Lunch standup
      ☐ 2,000+ DAU target
      ☐ No critical issues
      ☐ 100% uptime maintained

18:00 - End of day review
      ☐ Performance metrics
      ☐ Revenue metrics
      ☐ User feedback
      ☐ Issues resolved
```

### 10.2 Launch Day Monitoring

```bash
# Watch critical metrics in real-time

DataDog Dashboard:
- API response time: <500ms ✓
- Error rate: <0.1% ✓
- Database CPU: <70% ✓
- Memory usage: <80% ✓
- Network throughput: <1Gbps ✓

Google Analytics:
- Sessions: Target 1K
- Bounce rate: <50%
- Avg session duration: >2 min

Stripe Dashboard:
- Successful charges: 100%
- Failed charges: 0%
- Payout processing: On schedule

Support Tickets:
- Response time: <1 hour
- Critical issues: 0
- User complaints: Monitor
```

---

## STEP 11: Post-Launch Operations (Days 15+)

### 11.1 First 24 Hours

```
- Monitor everything closely
- Respond to all support tickets within 1 hour
- Watch for any system issues
- Track user feedback
- Verify payment processing
- Check email delivery
- Ensure backup processes running
```

### 11.2 First 7 Days

```
Daily:
- Review error logs
- Check payment metrics
- Monitor user growth
- Verify backup completion
- Review support tickets

Weekly:
- Analyze user data
- Review performance metrics
- Plan marketing campaigns
- Schedule feature releases
- Security audit
```

### 11.3 First 30 Days

```
- Daily active users: 5,000+
- Monthly revenue: R$ 50,000+
- Customer satisfaction: 4.5+ stars
- System uptime: 99.9%+
- Payment success rate: 99.5%+
```

---

## Key Contacts & Escalation

```
OnCall Engineer: [NAME] +55 85 [PHONE]
Support Lead: [NAME] +55 85 [PHONE]
Database Admin: [NAME] +55 85 [PHONE]
Product Manager: [NAME] +55 85 [PHONE]
CEO/Founder: [NAME] +55 85 [PHONE]

Escalation:
Critical Issue (5xx errors, payment failures) → OnCall Engineer
High Priority (performance degradation) → Support Lead → OnCall Engineer
Medium Priority (feature bugs) → Product Manager
Low Priority (UI/UX feedback) → Support Team
```

---

## Success Criteria (Month 1)

```
User Metrics:
✓ 10,000 total sign-ups
✓ 5,000 daily active users
✓ 30% Day 7 retention
✓ 4.5+ app store rating

Revenue Metrics:
✓ R$ 50,000 total revenue
✓ R$ 5 average revenue per user
✓ 10% cosmetics conversion rate
✓ 5% game reward withdrawal rate

Technical Metrics:
✓ 99.9% uptime
✓ <500ms API response time
✓ <0.1% error rate
✓ 99.5% payment success rate
```

---

## Additional Resources

- Vercel Docs: https://vercel.com/docs
- Stripe Documentation: https://stripe.com/docs
- SendGrid API: https://sendgrid.com/docs
- AWS RDS: https://docs.aws.amazon.com/rds/
- DataDog Monitoring: https://docs.datadoghq.com
- Sentry Error Tracking: https://docs.sentry.io

---

**Ready to launch? Let's make OnGame a success! 🚀**

