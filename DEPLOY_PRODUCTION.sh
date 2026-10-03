#!/bin/bash

# OnCreators Production Deployment Script
# Deploys to Vercel (Frontend) + Railway (Backend)

set -e

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                                                                ║"
echo "║     🚀 ONCREATORS PRODUCTION DEPLOYMENT 🚀                    ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
VERCEL_TOKEN="${VERCEL_TOKEN:-}"
RAILWAY_TOKEN="${RAILWAY_TOKEN:-}"
GITHUB_TOKEN="${GITHUB_TOKEN:-}"

# Step 1: Verify Prerequisites
echo -e "${BLUE}Step 1: Verifying Prerequisites...${NC}"
echo ""

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js $(node --version)${NC}"

if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ NPM not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ NPM $(npm --version)${NC}"

echo ""

# Step 2: Check for Vercel CLI
echo -e "${BLUE}Step 2: Setting up Vercel CLI...${NC}"
echo ""

if ! command -v vercel &> /dev/null; then
    echo "Installing Vercel CLI globally..."
    npm install -g vercel > /dev/null 2>&1
fi
echo -e "${GREEN}✅ Vercel CLI ready${NC}"

echo ""

# Step 3: Check for Railway CLI
echo -e "${BLUE}Step 3: Setting up Railway CLI...${NC}"
echo ""

if ! command -v railway &> /dev/null; then
    echo "Installing Railway CLI globally..."
    npm install -g @railway/cli > /dev/null 2>&1
fi
echo -e "${GREEN}✅ Railway CLI ready${NC}"

echo ""

# Step 4: Build Backend
echo -e "${BLUE}Step 4: Building OnCreators Backend...${NC}"
echo ""

cd oncreators
npm install --legacy-peer-deps > /dev/null 2>&1
npm run build > /dev/null 2>&1
echo -e "${GREEN}✅ Backend build complete${NC}"
cd ..

echo ""

# Step 5: Build Frontend
echo -e "${BLUE}Step 5: Building OnCreators Frontend...${NC}"
echo ""

cd oncreators-web
npm install --legacy-peer-deps > /dev/null 2>&1
npm run build > /dev/null 2>&1
echo -e "${GREEN}✅ Frontend build complete${NC}"
cd ..

echo ""

# Step 6: Deploy Information
echo -e "${YELLOW}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}DEPLOYMENT READY${NC}"
echo ""
echo "✅ All builds completed successfully"
echo ""
echo -e "${YELLOW}To complete production deployment:${NC}"
echo ""
echo "1. Deploy Frontend to Vercel:"
echo "   ${BLUE}cd oncreators-web${NC}"
echo "   ${BLUE}vercel --prod${NC}"
echo ""
echo "2. Deploy Backend to Railway:"
echo "   ${BLUE}cd ../oncreators${NC}"
echo "   ${BLUE}railway up${NC}"
echo ""
echo "3. Setup Database:"
echo "   - Add PostgreSQL plugin in Railway dashboard"
echo "   - Copy DATABASE_URL to .env"
echo "   - Run: ${BLUE}railway run npm run db:migrate${NC}"
echo ""
echo "4. Environment Variables (set in both Vercel & Railway):"
echo "   - DATABASE_URL=<railway-postgres-url>"
echo "   - JWT_SECRET=<random-32-chars>"
echo "   - STRIPE_SECRET_KEY=sk_live_..."
echo "   - SENDGRID_API_KEY=SG..."
echo "   - REDIS_URL=<railway-redis>"
echo "   - FRONTEND_URL=<your-domain>"
echo ""
echo -e "${YELLOW}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo "📚 Full instructions: ${BLUE}DEPLOY_TO_PRODUCTION.md${NC}"
echo ""

echo -e "${GREEN}🎬 OnCreators is ready for production! 🚀${NC}"
echo ""
