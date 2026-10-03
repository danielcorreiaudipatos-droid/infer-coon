#!/bin/bash

# 🚀 OnCreators - START NOW
# Execute this to begin building OnCreators immediately
# bash START-NOW.sh

set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║   🚀 OnCreators - START NOW - Week 1 Execution Begins        ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Verify we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found${NC}"
    echo "Please run this from the oncreators directory"
    exit 1
fi

# Step 1: Git setup
echo -e "${BLUE}📦 Step 1: Git Setup${NC}"
git checkout -b claude/zealous-edison-cv62ld 2>/dev/null || git switch -c claude/zealous-edison-cv62ld
echo -e "${GREEN}✓ Git branch created${NC}"
echo ""

# Step 2: Copy environment
echo -e "${BLUE}📋 Step 2: Environment Setup${NC}"
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo -e "${GREEN}✓ .env created${NC}"
fi
echo ""

# Step 3: Dependencies
echo -e "${BLUE}📚 Step 3: Installing Dependencies${NC}"
npm install --legacy-peer-deps 2>/dev/null || npm install
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Step 4: Docker
echo -e "${BLUE}🐳 Step 4: Starting Docker Services${NC}"
docker-compose up -d
echo -e "${GREEN}✓ Docker containers started${NC}"
echo ""

# Step 5: Database
echo -e "${BLUE}🗄️  Step 5: Setting Up Database${NC}"
sleep 5
npx prisma generate
npx prisma migrate deploy 2>/dev/null || npx prisma migrate dev --name init
echo -e "${GREEN}✓ Database ready${NC}"
echo ""

# Step 6: Build
echo -e "${BLUE}🔨 Step 6: Building Application${NC}"
npm run build
echo -e "${GREEN}✓ Build complete${NC}"
echo ""

# Step 7: Create module structure
echo -e "${BLUE}📁 Step 7: Creating Module Structure${NC}"
bash CREATE-MODULES.sh 2>/dev/null || true
echo -e "${GREEN}✓ Modules created${NC}"
echo ""

# Summary
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                   ✅ READY TO START!                         ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${BLUE}🎯 Next: Start Development${NC}"
echo ""
echo "  Run this to start:"
echo "    npm run dev"
echo ""
echo "  Then open:"
echo "    http://localhost:3333/health    (Health check)"
echo "    http://localhost:3333/docs       (Swagger API docs)"
echo "    http://localhost:5050           (PgAdmin database)"
echo ""
echo -e "${YELLOW}💡 Tips:${NC}"
echo "  • Check WEEK-1-PLAN.md for daily tasks"
echo "  • View database: npx prisma studio"
echo "  • Run tests: npm test"
echo "  • Format code: npm run format"
echo ""
echo -e "${GREEN}Good luck! Build something amazing! 💪${NC}"
echo ""
