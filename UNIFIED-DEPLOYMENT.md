# 🚀 Unified Deployment Guide - All Applications

Complete guide to deploy **ALL** applications simultaneously to production.

## 📦 Applications Overview

### Backend APIs (NestJS)
| App | Location | Status | Endpoint |
|-----|----------|--------|----------|
| **Infer Coon** | `/src` | ✅ Ready | `https://infer-coon-api.vercel.app` |
| **ONNEWS** | `/api-onnews` | ✅ Ready (6/6 tests) | `https://onnews-api.vercel.app` |
| **ADS Backend** | `/ads-backend` | 🔄 Optional | `https://ads-api.vercel.app` |

### Frontend Applications
| App | Location | Type | Status | Endpoint |
|-----|----------|------|--------|----------|
| **Main Website** | `/frontend` | Static HTML | ✅ Ready | `https://infer-coon.vercel.app` |
| **ADS Frontend** | `/ads-frontend` | Node.js | 🔄 Optional | `https://ads.infer-coon.vercel.app` |
| **Landing Pages** | `/landing-pages` | Static | ✅ Ready | Various |

### Mobile Applications
| App | Location | Type | Status |
|-----|----------|------|--------|
| **ONNEWS Mobile** | `/mobile-onnews` | React Native | ✅ Code Ready |
| **Mobile App** | `/mobile-app` | React Native | 🔄 Check |
| **App Mobile** | `/app-mobile` | React Native | 🔄 Check |

### Legacy/Featured Apps (in Frontend)
| App | Status | Location |
|-----|--------|----------|
| **OnGame** | 🎮 Games | `/frontend/inferencia` |
| **OnZap** | 💬 Chat/Messaging | `/frontend/onzap_landing.html` |
| **OnLove** | 💑 Social | `/frontend/onlove_landing.html` |
| **OnMail** | 📧 Email | `/frontend/onmail.html` |
| **OnNews** | 📰 News | `/frontend/news.html` |

---

## 🎯 Quick Setup (5 minutes)

### Step 1: Configure Vercel Projects

```bash
# Create projects for each app
vercel projects add infer-coon-api
vercel projects add onnews-api
vercel projects add infer-coon-website
vercel projects add ads-api  # Optional
vercel projects add ads-frontend  # Optional
```

### Step 2: Add GitHub Secrets

Access: `https://github.com/danielcorreiaudipatos-droid/infer-coon/settings/secrets/actions`

```
VERCEL_TOKEN              = <from vercel whoami --token>
VERCEL_ORG_ID             = <from vercel teams ls>
VERCEL_ORG_SCOPE          = <from vercel teams ls>
VERCEL_PROJECT_ID_INFER   = <project id>
VERCEL_PROJECT_ID_ONNEWS  = <project id>
VERCEL_PROJECT_ID_WEBSITE = <project id>
VERCEL_PROJECT_ID_ADS     = <project id>  # Optional
VERCEL_PROJECT_ID_ADS_FRONTEND = <project id>  # Optional
```

### Step 3: Configure Environment Variables

For each Vercel project, add:

**Infer Coon API:**
- DATABASE_URL (NestJS)
- JWT_SECRET
- NODE_ENV

**ONNEWS API:**
- DATABASE_URL (PostgreSQL)
- JWT_SECRET
- JWT_EXPIRATION

**Website:**
- NEXT_PUBLIC_API_URL (if Next.js)
- NEXT_PUBLIC_ONNEWS_URL

### Step 4: Deploy!

```bash
# Push to main - everything auto-deploys
git add -A
git commit -m "Ready for production"
git push origin main
```

---

## 📊 What Deploys When You Push

```
Push to main branch
    ↓
GitHub Actions Triggered
    ├─ Test Infer Coon API
    ├─ Test ONNEWS API (6 tests)
    ├─ Test ADS Backend (if exists)
    ├─ Build & Deploy Infer Coon → Vercel
    ├─ Build & Deploy ONNEWS → Vercel
    ├─ Build & Deploy Website → Vercel
    ├─ Build & Deploy ADS Backend → Vercel
    └─ Build & Deploy ADS Frontend → Vercel
    ↓
All applications LIVE ✅
```

---

## 🌐 Live Endpoints

### APIs
```
Infer Coon:    https://infer-coon-api.vercel.app/api
ONNEWS:        https://onnews-api.vercel.app/api
ADS:           https://ads-api.vercel.app/api
```

### Swagger Documentation
```
Infer Coon:    https://infer-coon-api.vercel.app/api
ONNEWS:        https://onnews-api.vercel.app/docs
```

### Websites
```
Main Site:     https://infer-coon.vercel.app
ADS Platform:  https://ads.infer-coon.vercel.app
```

### Featured Apps (in Frontend)
```
OnGame:        https://infer-coon.vercel.app/inferencia/web
OnZap:         https://infer-coon.vercel.app/onzap_landing.html
OnLove:        https://infer-coon.vercel.app/onlove_landing.html
OnMail:        https://infer-coon.vercel.app/onmail.html
OnNews:        https://infer-coon.vercel.app/news.html
```

---

## 📋 Apps That Need Frontend Modernization

These are currently static HTML. Consider migrating to Next.js/React:

1. **OnGame** - Games platform
   - Location: `frontend/inferencia`
   - Needs: Gaming mechanics, real-time updates
   - Suggestion: Move to React + WebSocket

2. **OnZap** - Chat/Messaging
   - Location: `frontend/onzap_landing.html`
   - Needs: Real-time messaging, notifications
   - Suggestion: Move to React + Socket.io

3. **OnLove** - Social Network
   - Location: `frontend/onlove_landing.html`
   - Needs: Social features, profiles
   - Suggestion: Move to Next.js

4. **OnMail** - Email Service
   - Location: `frontend/onmail.html`
   - Needs: Email interface, real-time updates
   - Suggestion: Move to React

5. **OnNews** - News Platform
   - Location: `frontend/news.html`
   - Needs: Dynamic content, updates
   - Suggestion: Already have ONNEWS backend!

---

## 🔧 Advanced: Docker Multi-Service Deployment

For local testing, use docker-compose:

```bash
docker-compose up
```

This should run:
- PostgreSQL
- Redis
- Infer Coon API (port 3000)
- ONNEWS API (port 3001)
- ADS Backend (port 3002)
- Website (port 3000 or 3003)

---

## 📱 Mobile Apps Deployment

### ONNEWS Mobile (React Native)

**iOS:**
```bash
cd mobile-onnews
eas build --platform ios
eas submit --platform ios
```

**Android:**
```bash
cd mobile-onnews
eas build --platform android
eas submit --platform android
```

### App Store Configuration
1. Create app in Apple App Store Connect
2. Create app in Google Play Console
3. Configure EAS:
   ```bash
   eas init
   eas configure
   ```

---

## 🚨 Troubleshooting

### Deployment Fails
1. Check GitHub Actions: https://github.com/danielcorreiaudipatos-droid/infer-coon/actions
2. Verify all secrets are set
3. Check Vercel dashboard for build errors

### API Returns 500
1. Check database connection
2. Verify environment variables
3. Check logs: `vercel logs <project-name>`

### CORS Errors
1. Update CORS_ORIGIN in environment variables
2. Configure headers in vercel.json

### Database Issues
1. Ensure PostgreSQL is running
2. Verify DATABASE_URL is correct
3. Run migrations: `npm run migrate`

---

## 📚 File Structure for Deployment

```
infer-coon/
├── .github/workflows/
│   ├── deploy-all.yml          ← Main deployment workflow
│   ├── deploy-onnews.yml       ← ONNEWS specific
│   └── deploy-infer-coon.yml   ← Infer Coon specific
├── src/                        ← Infer Coon API (NestJS)
├── api-onnews/                 ← ONNEWS API (NestJS)
├── ads-backend/                ← ADS Backend (NestJS)
├── frontend/                   ← Main Website (Static HTML)
├── ads-frontend/               ← ADS Frontend (React/Node)
├── mobile-onnews/              ← ONNEWS Mobile (React Native)
├── vercel-onnews.json          ← ONNEWS Vercel config
├── vercel.json                 ← Default Vercel config
├── docker-compose.yml          ← Local development
└── UNIFIED-DEPLOYMENT.md       ← This file
```

---

## 🎯 Next Steps

### Immediate
- [ ] Configure Vercel projects
- [ ] Add GitHub secrets
- [ ] Set environment variables
- [ ] Test first deployment

### Short-term
- [ ] Setup monitoring (Sentry, DataDog)
- [ ] Configure backups
- [ ] Setup alerting
- [ ] Document APIs

### Medium-term
- [ ] Migrate OnGame, OnZap, etc. to modern stack
- [ ] Optimize database queries
- [ ] Implement caching
- [ ] Add comprehensive tests

### Long-term
- [ ] Migrate to microservices if needed
- [ ] Implement CI/CD for mobile apps
- [ ] Setup analytics
- [ ] Plan scaling strategy

---

## 💡 Pro Tips

1. **Test Locally First**
   ```bash
   docker-compose up
   npm test  # Run all tests
   ```

2. **Monitor Deployments**
   - GitHub Actions: https://github.com/danielcorreiaudipatos-droid/infer-coon/actions
   - Vercel Dashboard: https://vercel.com/dashboard

3. **Quick Rollback**
   ```bash
   # If deployment fails, use previous version
   vercel rollback <project-id>
   ```

4. **View Logs**
   ```bash
   vercel logs infer-coon-api --follow
   vercel logs onnews-api --follow
   ```

5. **Database Migrations**
   ```bash
   npm run migrate  # For Prisma
   npm run migrate:latest  # For others
   ```

---

## 📞 Support

For issues or questions:
1. Check GitHub Issues
2. Review CI/CD logs
3. Check Vercel logs
4. Test locally with docker-compose

---

**Status**: ✅ Ready for Production
**Last Updated**: 2026-10-03
**All Systems**: GO 🚀

