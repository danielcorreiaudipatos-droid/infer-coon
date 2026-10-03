# 🚀 DEPLOY STAGING - INSTRUCTIONS

## Option 1: Deploy via Vercel CLI (Fastest)

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy OnGame staging
vercel --prod --name ongame-staging

# 4. Deploy COON staging  
cd coon
vercel --prod --name coon-staging
```

## Option 2: Deploy via GitHub (Automatic)

```bash
# Just push to main branch
git push origin main

# Vercel will auto-deploy if configured in dashboard
# Check: https://vercel.com/dashboard
```

## Option 3: Deploy via Web UI

1. Go to https://vercel.com/dashboard
2. Click "New Project"
3. Select GitHub repo: danielcorreiaudipatos-droid/infer-coon
4. Configure:
   - Framework: Next.js
   - Root Directory: ./
   - Build Command: npm run build
5. Click "Deploy"

---

## 📊 Expected Results

```
OnGame Staging:
├─ URL: https://ongame-staging.vercel.app
├─ Status: Live in ~2-5 minutes
└─ Landing pages, cosmetics, wallet, analytics

COON Staging:
├─ URL: https://coon-staging.vercel.app
├─ Status: Live in ~2-5 minutes
└─ Identical to OnGame
```

---

## ✅ Verify Deployment

After deploy, test:

1. **Landing Page:**
   - https://ongame-staging.vercel.app/landing/onzap
   - https://ongame-staging.vercel.app/landing/onlove
   - https://ongame-staging.vercel.app/landing/onmail

2. **Game Pages:**
   - https://ongame-staging.vercel.app/game/onzap
   - https://ongame-staging.vercel.app/game/onlove
   - https://ongame-staging.vercel.app/game/onmail

3. **Dashboard:**
   - https://ongame-staging.vercel.app/dashboard

---

## 🎯 Next After Deployment

1. ✅ Verify all pages load
2. ✅ Test game functionality
3. ✅ Check leaderboards
4. ✅ Test wallet (mock mode)
5. ✅ Share with beta testers
6. ✅ Collect feedback
7. ✅ Deploy production

---

## 📝 Commands Quick Reference

```bash
# OnGame only
vercel --prod --name ongame-staging

# COON only
cd coon && vercel --prod --name coon-staging

# Both in parallel (from root)
vercel --prod --name ongame-staging & \
cd coon && vercel --prod --name coon-staging

# Check deployment status
vercel list
```

---

## ⚠️ Troubleshooting

**Build fails?**
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Vercel CLI not found?**
```bash
npm install -g vercel@latest
vercel --version
```

**Need to reconfigure?**
```bash
vercel unlink
vercel project add
```

---

**Status: READY FOR IMMEDIATE DEPLOYMENT** ✅

Deploy now and you'll be live in 5 minutes!
