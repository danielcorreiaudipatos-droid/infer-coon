#!/bin/bash

# 🚀 OnCreators - Quick Start Script
# Execute: bash QUICK-START.sh

set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║        🚀 OnCreators API - Quick Start                        ║"
echo "║   Premium Creator Marketplace for COON Ecosystem              ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Step 1: Setup environment
echo -e "${BLUE}Step 1: Setting up environment...${NC}"
if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${GREEN}✓ Created .env file${NC}"
else
    echo -e "${GREEN}✓ .env already exists${NC}"
fi
echo ""

# Step 2: Install dependencies
echo -e "${BLUE}Step 2: Installing dependencies...${NC}"
npm install
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Step 3: Start Docker containers
echo -e "${BLUE}Step 3: Starting Docker containers...${NC}"
docker-compose up -d
echo -e "${GREEN}✓ Docker containers started${NC}"
echo ""

# Wait for database to be ready
echo -e "${YELLOW}⏳ Waiting for database to be ready...${NC}"
sleep 5

# Step 4: Setup Prisma
echo -e "${BLUE}Step 4: Setting up database...${NC}"
npx prisma generate
npx prisma migrate deploy || npx prisma migrate dev --name init
echo -e "${GREEN}✓ Database setup complete${NC}"
echo ""

# Step 5: Seed database (optional)
echo -e "${BLUE}Step 5: Seeding database...${NC}"
npx prisma db seed || echo "⚠️  No seed file yet"
echo ""

# Step 6: Build the application
echo -e "${BLUE}Step 6: Building application...${NC}"
npm run build
echo -e "${GREEN}✓ Build complete${NC}"
echo ""

# Summary
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                  ✅ SETUP COMPLETE!                           ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${BLUE}📚 Next Steps:${NC}"
echo ""
echo "  1. Start the development server:"
echo "     npm run dev"
echo ""
echo "  2. Visit the API:"
echo "     http://localhost:3333"
echo ""
echo "  3. View Swagger documentation:"
echo "     http://localhost:3333/docs"
echo ""
echo "  4. Manage database:"
echo "     http://localhost:5050 (PgAdmin)"
echo "     Email: admin@oncreators.com"
echo "     Password: admin"
echo ""
echo "  5. View database schema:"
echo "     npx prisma studio"
echo ""
echo -e "${GREEN}🎉 Your OnCreators API is ready!${NC}"
echo ""
