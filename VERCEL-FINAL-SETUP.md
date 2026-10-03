# 🚀 VERCEL FINAL SETUP - Execute Now!

**⏱️ Time required: 15 minutes**

## ✅ Option A: Automated Setup (RECOMMENDED)

### Run this on your local machine:

```bash
# Clone the latest code
git clone https://github.com/danielcorreiaudipatos-droid/infer-coon.git
cd infer-coon

# Run automated setup
bash quick-vercel-setup.sh
```

This script will:
1. ✅ Install Vercel CLI
2. ✅ Login to your Vercel account
3. ✅ Create all necessary projects
4. ✅ Display all secrets to add to GitHub
5. ✅ Guide you through environment variables
6. ✅ Deploy ONNEWS API for testing

---

## ⚙️ Option B: Manual Setup (Step-by-Step)

### Step 1: Install & Login (2 min)

```bash
npm install -g vercel
vercel login
```

### Step 2: Create Projects (3 min)

```bash
vercel projects add infer-coon-api
vercel projects add onnews-api
vercel projects add infer-coon-website
```

Get project IDs:
```bash
vercel projects ls
```

### Step 3: Get Your Secrets (2 min)

```bash
# Get your token
vercel whoami --token

# Get your org info
vercel teams ls
```

### Step 4: Add GitHub Secrets (3 min)

Go to: **GitHub → Your Repo → Settings → Secrets and Variables → Actions → New Repository Secret**

Add these 6 secrets:

| Name | Value |
|------|-------|
| `VERCEL_TOKEN` | Output from `vercel whoami --token` |
| `VERCEL_ORG_ID` | From `vercel teams ls` |
| `VERCEL_ORG_SCOPE` | From `vercel teams ls` |
| `VERCEL_PROJECT_ID_INFER` | From `vercel projects ls` |
| `VERCEL_PROJECT_ID_ONNEWS` | From `vercel projects ls` |
| `VERCEL_PROJECT_ID_WEBSITE` | From `vercel projects ls` |

### Step 5: Configure Environment Variables (3 min)

#### For `infer-coon-api` project:
Go to: https://vercel.com/dashboard/infer-coon-api/settings/environment-variables

Add:
```
DATABASE_URL = postgresql://user:password@host:5432/database
JWT_SECRET = your-secret-key-here (min 32 chars)
NODE_ENV = production
```

#### For `onnews-api` project:
Go to: https://vercel.com/dashboard/onnews-api/settings/environment-variables

Add:
```
DATABASE_URL = postgresql://user:password@host:5432/database
JWT_SECRET = your-secret-key-here (min 32 chars)
JWT_EXPIRATION = 24h
NODE_ENV = production
```

#### For `infer-coon-website` project:
Go to: https://vercel.com/dashboard/infer-coon-website/settings/environment-variables

Add:
```
NEXT_PUBLIC_API_URL = https://infer-coon-api.vercel.app
```

### Step 6: Deploy Everything (1 min)

Push to main - everything auto-deploys!

```bash
git add -A
git commit -m "Vercel setup complete - production ready"
git push origin main
```

---

## 📊 What Happens Next

1. **GitHub Actions Triggered** (automatic)
   ```
   Push to main
      ↓
   Tests run (6 tests for ONNEWS)
      ↓
   Build all apps
      ↓
   Deploy to Vercel
      ↓
   ✅ LIVE (7-10 min)
   ```

2. **Check Progress**
   - GitHub Actions: https://github.com/danielcorreiaudipatos-droid/infer-coon/actions
   - Vercel Dashboard: https://vercel.com/dashboard

3. **View Logs**
   ```bash
   vercel logs infer-coon-api --follow
   vercel logs onnews-api --follow
   vercel logs infer-coon-website --follow
   ```

---

## 🌐 Your Live Applications

After deployment, access:

**APIs:**
- Infer Coon: https://infer-coon-api.vercel.app/api
- ONNEWS: https://onnews-api.vercel.app/api

**Swagger Documentation:**
- Infer Coon: https://infer-coon-api.vercel.app/api
- ONNEWS: https://onnews-api.vercel.app/docs

**Websites:**
- Main Site: https://infer-coon.vercel.app
- Admin: https://infer-coon.vercel.app/admin.html

**Featured Apps (all on main site):**
- OnGame: https://infer-coon.vercel.app/inferencia
- OnZap: https://infer-coon.vercel.app/onzap_landing.html
- OnLove: https://infer-coon.vercel.app/onlove_landing.html
- OnMail: https://infer-coon.vercel.app/onmail.html
- OnNews: https://infer-coon.vercel.app/news.html

---

## 🚨 Troubleshooting

### Build fails with "Cannot find module"
```bash
cd api-onnews
npm ci
npm run build
```

### Deployment doesn't trigger
1. Verify secrets are set: `Settings > Secrets > Actions`
2. Check VERCEL_TOKEN is valid
3. Verify GitHub Actions is enabled

### Health check fails
1. Check Vercel logs: `vercel logs <project> --follow`
2. Verify DATABASE_URL is correct
3. Make sure database is accessible from Vercel

### CORS errors
Update in Vercel project settings:
```
DATABASE_URL and other env vars
```

---

## 📋 Verification Checklist

- [ ] Vercel CLI installed (`vercel --version`)
- [ ] Logged into Vercel (`vercel whoami`)
- [ ] 3 projects created (`vercel projects ls`)
- [ ] 6 GitHub secrets added
- [ ] Environment variables configured in Vercel
- [ ] Can access: https://onnews-api.vercel.app/health
- [ ] GitHub Actions passed
- [ ] All apps are live

---

## 💡 Tips

1. **Test locally first:**
   ```bash
   docker-compose up
   npm test
   ```

2. **View real-time logs:**
   ```bash
   vercel logs infer-coon-api --follow
   ```

3. **Quick rollback:**
   ```bash
   vercel rollback <project-id>
   ```

4. **Check deployment history:**
   ```bash
   vercel deployments
   ```

---

## 📞 Need Help?

1. Check GitHub Actions logs: https://github.com/danielcorreiaudipatos-droid/infer-coon/actions
2. Check Vercel dashboard: https://vercel.com/dashboard
3. Review UNIFIED-DEPLOYMENT.md for detailed info
4. Review VERCEL-SETUP.md for additional guidance

---

## ✨ You're Ready!

**Everything is configured. Your applications are ready to go live.**

### Execute one of these:

**Option A (Automated):**
```bash
bash quick-vercel-setup.sh
```

**Option B (Manual):**
Follow steps 1-6 above

**Then:**
```bash
git push origin main
```

**That's it! All apps will be live in 10 minutes. 🚀**

---

**Status**: ✅ All configuration files ready
**Next Step**: Run setup script or follow manual steps
**Expected Time**: 15 minutes total

