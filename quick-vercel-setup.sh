#!/bin/bash

# 🚀 VERCEL QUICK SETUP - Automated Configuration
# This script automates the entire Vercel setup process

set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║         VERCEL AUTOMATED SETUP - All Apps in 10 min           ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

echo "✅ Vercel CLI found"
echo ""

# Step 1: Login
echo "🔐 Step 1: Logging in to Vercel..."
echo "⚠️  A browser window will open for authentication"
echo "   Please complete the login process..."
echo ""
vercel login

echo ""
echo "✅ Login successful"
echo ""

# Step 2: Get user info
echo "📊 Step 2: Getting your Vercel account information..."
VERCEL_TOKEN=$(vercel whoami --token)
echo "  Token obtained ✓"

ORG_INFO=$(vercel teams ls --json 2>/dev/null | jq -r '.[] | "\(.id) \(.slug)"' | head -1)
VERCEL_ORG_ID=$(echo $ORG_INFO | cut -d' ' -f1)
VERCEL_ORG_SCOPE=$(echo $ORG_INFO | cut -d' ' -f2)

echo "  Organization: $VERCEL_ORG_SCOPE ✓"
echo ""

# Step 3: Create projects
echo "🏗️  Step 3: Creating Vercel projects..."
echo ""

echo "  Creating: infer-coon-api"
vercel projects add infer-coon-api > /dev/null 2>&1 || true
INFER_PROJECT_ID=$(vercel projects ls --json 2>/dev/null | jq -r '.[] | select(.name == "infer-coon-api") | .id')
echo "    ✓ ID: $INFER_PROJECT_ID"

echo "  Creating: onnews-api"
vercel projects add onnews-api > /dev/null 2>&1 || true
ONNEWS_PROJECT_ID=$(vercel projects ls --json 2>/dev/null | jq -r '.[] | select(.name == "onnews-api") | .id')
echo "    ✓ ID: $ONNEWS_PROJECT_ID"

echo "  Creating: infer-coon-website"
vercel projects add infer-coon-website > /dev/null 2>&1 || true
WEBSITE_PROJECT_ID=$(vercel projects ls --json 2>/dev/null | jq -r '.[] | select(.name == "infer-coon-website") | .id')
echo "    ✓ ID: $WEBSITE_PROJECT_ID"

echo ""

# Step 4: Display secrets to add
echo "🔑 Step 4: GitHub Secrets Configuration"
echo ""
echo "Go to: https://github.com/danielcorreiaudipatos-droid/infer-coon/settings/secrets/actions"
echo ""
echo "Add these secrets:"
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║ Secret Name: VERCEL_TOKEN                                  ║"
echo "║ Value:                                                     ║"
echo "║ $VERCEL_TOKEN"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║ Secret Name: VERCEL_ORG_ID                                 ║"
echo "║ Value: $VERCEL_ORG_ID"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║ Secret Name: VERCEL_ORG_SCOPE                              ║"
echo "║ Value: $VERCEL_ORG_SCOPE"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║ Secret Name: VERCEL_PROJECT_ID_INFER                       ║"
echo "║ Value: $INFER_PROJECT_ID"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║ Secret Name: VERCEL_PROJECT_ID_ONNEWS                      ║"
echo "║ Value: $ONNEWS_PROJECT_ID"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║ Secret Name: VERCEL_PROJECT_ID_WEBSITE                     ║"
echo "║ Value: $WEBSITE_PROJECT_ID"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

read -p "Press ENTER after adding all secrets to GitHub..."
echo ""

# Step 5: Configure environment variables
echo "⚙️  Step 5: Configuring Environment Variables"
echo ""
echo "📍 Infer Coon API:"
echo "   URL: https://vercel.com/dashboard/infer-coon-api/settings/environment-variables"
echo "   Add:"
echo "   - DATABASE_URL (your PostgreSQL connection)"
echo "   - JWT_SECRET (your secret key)"
echo ""

echo "📍 ONNEWS API:"
echo "   URL: https://vercel.com/dashboard/onnews-api/settings/environment-variables"
echo "   Add:"
echo "   - DATABASE_URL (your PostgreSQL connection)"
echo "   - JWT_SECRET (your secret key)"
echo "   - JWT_EXPIRATION=24h"
echo ""

echo "📍 Website:"
echo "   URL: https://vercel.com/dashboard/infer-coon-website/settings/environment-variables"
echo "   Add:"
echo "   - NEXT_PUBLIC_API_URL=https://infer-coon-api.vercel.app"
echo ""

read -p "Press ENTER after configuring all environment variables..."
echo ""

# Step 6: Save config
echo "💾 Step 6: Saving Configuration"
echo ""

cat > /tmp/vercel-config.json << VERCEL_CONFIG
{
  "vercel_token": "$VERCEL_TOKEN",
  "vercel_org_id": "$VERCEL_ORG_ID",
  "vercel_org_scope": "$VERCEL_ORG_SCOPE",
  "projects": {
    "infer_coon_api": "$INFER_PROJECT_ID",
    "onnews_api": "$ONNEWS_PROJECT_ID",
    "website": "$WEBSITE_PROJECT_ID"
  }
}
VERCEL_CONFIG

echo "✓ Configuration saved"
echo ""

# Step 7: Test first deployment
echo "🚀 Step 7: First Deployment"
echo ""
echo "We'll deploy ONNEWS API to test the setup..."
echo ""

cd api-onnews
echo "  Testing ONNEWS build..."
npm ci > /dev/null 2>&1
npm run build > /dev/null 2>&1
npm test -- --passWithNoTests > /dev/null 2>&1
echo "  ✓ Build successful"

echo ""
echo "  Deploying to Vercel..."
vercel --prod --name=onnews-api > /dev/null 2>&1
echo "  ✓ Deployment initiated"

cd ..
echo ""

# Step 8: Summary
echo "╔════════════════════════════════════════════════════════════╗"
echo "║              ✅ VERCEL SETUP COMPLETE!                    ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "📍 Your Projects:"
echo ""
echo "  🔵 Infer Coon API"
echo "     https://vercel.com/dashboard/infer-coon-api"
echo "     Endpoint: https://infer-coon-api.vercel.app"
echo ""
echo "  📺 ONNEWS API"
echo "     https://vercel.com/dashboard/onnews-api"
echo "     Endpoint: https://onnews-api.vercel.app"
echo "     Docs: https://onnews-api.vercel.app/docs"
echo ""
echo "  🌐 Website"
echo "     https://vercel.com/dashboard/infer-coon-website"
echo "     Endpoint: https://infer-coon.vercel.app"
echo ""

echo "🎯 Next Steps:"
echo ""
echo "1. Make sure all environment variables are configured"
echo "2. Check deployment status:"
echo "   GitHub Actions: https://github.com/danielcorreiaudipatos-droid/infer-coon/actions"
echo ""
echo "3. To deploy everything automatically:"
echo "   git add -A"
echo "   git commit -m 'Vercel setup complete'"
echo "   git push origin main"
echo ""
echo "   GitHub Actions will automatically:"
echo "   ✓ Run tests"
echo "   ✓ Build all apps"
echo "   ✓ Deploy to Vercel"
echo ""
echo "4. Monitor your deployments:"
echo "   vercel logs infer-coon-api --follow"
echo "   vercel logs onnews-api --follow"
echo ""

echo "═════════════════════════════════════════════════════════════"
echo "✨ All systems configured and ready! ✨"
echo "═════════════════════════════════════════════════════════════"
