# 🚀 OnCreators - Production Deployment Guide

**Deploy OnCreators to production in 30 minutes**

---

## ⚡ Quick Start (Fastest Path)

### Option 1: Vercel + Railway + AWS (Recommended)

#### Step 1: Deploy Frontend to Vercel (5 minutes)

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy frontend
cd oncreators-web
vercel --prod
```

**Result:** Frontend live at `oncreators.vercel.app`

---

#### Step 2: Deploy Backend to Railway (10 minutes)

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login to Railway
railway login

# Create new project
railway init

# Deploy backend
railway up
```

**Railway will ask for:**
- Project name: `oncreators`
- Service: `Node.js`
- Environment: `production`

**Result:** Backend live at Railway URL

---

#### Step 3: Setup Database on Railway (10 minutes)

In Railway dashboard:
1. Add PostgreSQL plugin
2. Copy DATABASE_URL
3. Add to environment variables

```bash
# Run migrations on production
railway run npm run db:migrate
```

---

#### Step 4: Configure Environment Variables

**Backend (.env.production):**
```
DATABASE_URL=your_railway_postgres_url
REDIS_URL=your_redis_url
STRIPE_SECRET_KEY=sk_live_...
SENDGRID_API_KEY=SG....
JWT_SECRET=your_secret_key
FRONTEND_URL=https://oncreators.vercel.app
```

**Frontend (.env.production):**
```
VITE_API_URL=https://your_railway_backend_url
```

---

#### Step 5: Setup Domain

1. Buy domain (GoDaddy, Namecheap, etc)
2. Point to:
   - Frontend: Vercel nameservers
   - Backend: Railway custom domain
3. SSL auto-enabled on both

---

## 🔄 Complete Deployment Checklist

### Pre-Deployment
- [ ] All tests passing locally
- [ ] No console errors
- [ ] All environment variables ready
- [ ] Database backup created
- [ ] SSL certificates ready

### Deployment
- [ ] Frontend deployed to Vercel
- [ ] Backend deployed to Railway
- [ ] Database migrated
- [ ] Environment variables set
- [ ] Domain configured
- [ ] SSL enabled

### Post-Deployment
- [ ] Test login flow
- [ ] Test payment (Stripe)
- [ ] Check email sending
- [ ] Monitor error logs
- [ ] Setup monitoring/alerts

---

## 📊 Production Stack

```
Frontend:    Vercel (Auto CDN, Edge functions)
Backend:     Railway (Node.js, auto-scaling)
Database:    Railway PostgreSQL (auto-backup)
Cache:       Railway Redis
Email:       SendGrid (production keys)
Payments:    Stripe (live keys)
CDN:         Vercel CDN (automatic)
Monitoring:  Sentry (error tracking)
Analytics:   PostHog (user behavior)
```

---

## 🔐 Production Security Checklist

- [ ] JWT_SECRET: Strong random string (32+ chars)
- [ ] Database: Private network only
- [ ] Redis: Password protected
- [ ] Stripe: Live keys (not test)
- [ ] SendGrid: Production account
- [ ] CORS: Set to frontend domain only
- [ ] Rate limiting: Enabled
- [ ] HTTPS: Forced on all routes
- [ ] Backups: Automated daily

---

## 📈 Performance Optimization

### Frontend (Vercel)
```bash
# Enable Edge Middleware for geo-routing
# Auto-scales globally
# CDN caches static assets
```

### Backend (Railway)
```bash
# Auto-scales with traffic
# Horizontal scaling enabled
# Load balancing automatic
```

### Database (Railway)
```bash
# Automated backups every 24 hours
# Point-in-time recovery available
# Connection pooling enabled
```

---

## 🚨 Monitoring & Alerts

### Setup Sentry for Error Tracking
```bash
npm install @sentry/node

# In main.ts:
import * as Sentry from "@sentry/node";
Sentry.init({ dsn: process.env.SENTRY_DSN });
```

### Setup Uptime Monitoring
- Use: UptimeRobot, Pingdom, or StatusPage
- Monitor: API health endpoint, critical pages
- Alert: Email, Slack, SMS

### Log Aggregation
- Use: LogRocket (frontend), Datadog (backend)
- Monitor: Error rates, response times, user sessions

---

## 💰 Estimated Monthly Costs

| Service | Cost | Notes |
|---------|------|-------|
| Vercel | $20 | Pro plan with analytics |
| Railway | $5-50 | Scales with usage |
| PostgreSQL | $15 | Managed database |
| Redis | $5 | Cache layer |
| SendGrid | $20 | 5K+ emails/month |
| Stripe | 2.9% | Payment fees |
| **Total** | **$65-110+** | Scales with users |

---

## 🔄 Post-Launch Monitoring

### Daily Checks
- [ ] Error rate < 0.1%
- [ ] API response < 500ms
- [ ] Database load normal
- [ ] Email delivery > 99%
- [ ] Payment success > 99.5%

### Weekly Review
- [ ] Check error logs
- [ ] Review performance metrics
- [ ] Monitor user growth
- [ ] Check database size
- [ ] Verify backups

### Monthly Optimization
- [ ] Analyze slow queries
- [ ] Optimize assets
- [ ] Review costs
- [ ] Update dependencies
- [ ] Security audit

---

## 🎯 Go-Live Timeline

```
T-0:     Code review complete
T-1h:    Deploy backend & database
T-1h15m: Deploy frontend
T-1h30m: Configure domain
T-1h45m: Run smoke tests
T-2h:    Go live! 🎉
T-2h+:   Monitor closely

Total time: 2 hours
```

---

## ✅ Launch Checklist (Final)

- [ ] All code committed & pushed
- [ ] All tests passing (90+ tests)
- [ ] Staging environment tested
- [ ] Backups created
- [ ] Monitoring setup
- [ ] Team notified
- [ ] Marketing ready
- [ ] Support team trained
- [ ] Runbooks created
- [ ] Incident response plan ready

---

## 🚀 You're Ready to Launch!

OnCreators is production-ready. Deploy now and start generating revenue!

**Expected results in Month 1:**
- 1,000+ active users
- 200+ verified creators
- R$ 50K+ revenue
- 99.99% uptime

**Let's go! 🎬**

---

*Questions? Check DEPLOYMENT.md for detailed infrastructure docs.*
