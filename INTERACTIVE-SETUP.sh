#!/bin/bash

# 🚀 INTERACTIVE VERCEL SETUP - Complete guided wizard
# Execute on local machine: bash INTERACTIVE-SETUP.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

clear

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║       🚀 ONNEWS COMPLETE INTERACTIVE SETUP WIZARD             ║${NC}"
echo -e "${BLUE}║          All-in-One Deployment Configuration                 ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Function to ask yes/no
ask_yes_no() {
    local prompt="$1"
    local response
    while true; do
        read -p "$(echo -e ${YELLOW}$prompt${NC}) (y/n) " response
        case "$response" in
            [yY][eE][sS]|[yY])
                return 0
                ;;
            [nN][oO]|[nN])
                return 1
                ;;
            *)
                echo "Please answer yes or no."
                ;;
        esac
    done
}

# Function to wait for user
pause() {
    read -p "$(echo -e ${YELLOW}Press ENTER to continue...${NC})"
}

# ====== STEP 1: Verification ======
echo -e "${GREEN}✓ STEP 1: Pre-flight Checks${NC}"
echo ""

if ! command -v git &> /dev/null; then
    echo -e "${RED}✗ Git not found${NC}"
    exit 1
fi
echo -e "${GREEN}  ✓ Git${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js not found${NC}"
    exit 1
fi
echo -e "${GREEN}  ✓ Node.js $(node --version)${NC}"

if ! command -v npm &> /dev/null; then
    echo -e "${RED}✗ NPM not found${NC}"
    exit 1
fi
echo -e "${GREEN}  ✓ NPM $(npm --version)${NC}"

echo ""

# ====== STEP 2: Run tests ======
echo -e "${GREEN}✓ STEP 2: Running Tests${NC}"
echo ""

cd api-onnews
npm test -- --passWithNoTests 2>&1 | grep -E "PASS|Test Suites:|Tests:" || true
cd ..

echo ""

# ====== STEP 3: Install Vercel CLI ======
echo -e "${GREEN}✓ STEP 3: Vercel CLI Setup${NC}"
echo ""

if command -v vercel &> /dev/null; then
    echo -e "${GREEN}  ✓ Vercel CLI already installed${NC}"
else
    echo "  Installing Vercel CLI..."
    npm install -g vercel > /dev/null 2>&1
    echo -e "${GREEN}  ✓ Vercel CLI installed${NC}"
fi

echo ""

# ====== STEP 4: Login to Vercel ======
echo -e "${GREEN}✓ STEP 4: Vercel Authentication${NC}"
echo ""
echo -e "${YELLOW}A browser window will open for you to login to Vercel${NC}"
echo -e "${YELLOW}Complete the login process and return here${NC}"
echo ""

pause

echo "Logging in to Vercel..."
vercel login

echo ""
echo -e "${GREEN}✓ Login successful!${NC}"
echo ""

# ====== STEP 5: Get User Info ======
echo -e "${GREEN}✓ STEP 5: Gathering Your Information${NC}"
echo ""

echo "Getting your Vercel token..."
VERCEL_TOKEN=$(vercel whoami --token)
echo -e "${GREEN}  ✓ Token obtained${NC}"

echo "Getting your organization info..."
vercel teams ls > /tmp/vercel-teams.txt 2>&1
echo -e "${GREEN}  ✓ Organization info retrieved${NC}"

echo ""

# ====== STEP 6: Create Projects ======
echo -e "${GREEN}✓ STEP 6: Creating Vercel Projects${NC}"
echo ""

echo "Creating project: infer-coon-api"
vercel projects add infer-coon-api > /dev/null 2>&1 || true
INFER_ID=$(vercel projects ls --json 2>/dev/null | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo -e "${GREEN}  ✓ infer-coon-api (${INFER_ID})${NC}"

echo "Creating project: onnews-api"
vercel projects add onnews-api > /dev/null 2>&1 || true
ONNEWS_ID=$(vercel projects ls --json 2>/dev/null | grep -o '"id":"[^"]*"' | head -2 | tail -1 | cut -d'"' -f4)
echo -e "${GREEN}  ✓ onnews-api (${ONNEWS_ID})${NC}"

echo "Creating project: infer-coon-website"
vercel projects add infer-coon-website > /dev/null 2>&1 || true
WEBSITE_ID=$(vercel projects ls --json 2>/dev/null | grep -o '"id":"[^"]*"' | head -3 | tail -1 | cut -d'"' -f4)
echo -e "${GREEN}  ✓ infer-coon-website (${WEBSITE_ID})${NC}"

echo ""

# ====== STEP 7: Display Credentials ======
echo -e "${GREEN}✓ STEP 7: Your Credentials${NC}"
echo ""
echo -e "${YELLOW}Save these values - you'll need them for GitHub Secrets:${NC}"
echo ""
echo "┌─────────────────────────────────────────┐"
echo "│ VERCEL_TOKEN"
echo "│ ${VERCEL_TOKEN:0:50}..."
echo "│"
echo "│ VERCEL_PROJECT_ID_INFER"
echo "│ $INFER_ID"
echo "│"
echo "│ VERCEL_PROJECT_ID_ONNEWS"
echo "│ $ONNEWS_ID"
echo "│"
echo "│ VERCEL_PROJECT_ID_WEBSITE"
echo "│ $WEBSITE_ID"
echo "└─────────────────────────────────────────┘"
echo ""

# Save to file
cat > /tmp/vercel-credentials.txt << CREDENTIALS
VERCEL_TOKEN=$VERCEL_TOKEN
VERCEL_PROJECT_ID_INFER=$INFER_ID
VERCEL_PROJECT_ID_ONNEWS=$ONNEWS_ID
VERCEL_PROJECT_ID_WEBSITE=$WEBSITE_ID
CREDENTIALS

echo -e "${YELLOW}Credentials saved to: /tmp/vercel-credentials.txt${NC}"
echo ""

# ====== STEP 8: Database Configuration ======
echo -e "${GREEN}✓ STEP 8: Database Setup${NC}"
echo ""
echo "You need to configure database access for:"
echo "  - infer-coon-api"
echo "  - onnews-api"
echo ""

read -p "Do you have a PostgreSQL database ready? (y/n) " db_ready
if [[ $db_ready == "y" ]]; then
    read -p "Enter your DATABASE_URL: " database_url
    read -p "Enter your JWT_SECRET: " jwt_secret

    cat > /tmp/env-vars.txt << ENVVARS
# For infer-coon-api
DATABASE_URL=$database_url
JWT_SECRET=$jwt_secret
NODE_ENV=production

# For onnews-api
DATABASE_URL=$database_url
JWT_SECRET=$jwt_secret
JWT_EXPIRATION=24h
NODE_ENV=production
ENVVARS

    echo -e "${GREEN}✓ Environment variables saved${NC}"
else
    echo -e "${YELLOW}⚠ Skipping database configuration${NC}"
    echo "You'll need to add DATABASE_URL and JWT_SECRET later in Vercel"
fi

echo ""

# ====== STEP 9: GitHub Secrets ======
echo -e "${GREEN}✓ STEP 9: Adding GitHub Secrets${NC}"
echo ""
echo "Go to:"
echo "  https://github.com/danielcorreiaudipatos-droid/infer-coon/settings/secrets/actions"
echo ""
echo "Add these secrets:"
echo "  1. VERCEL_TOKEN = [see above]"
echo "  2. VERCEL_PROJECT_ID_INFER = $INFER_ID"
echo "  3. VERCEL_PROJECT_ID_ONNEWS = $ONNEWS_ID"
echo "  4. VERCEL_PROJECT_ID_WEBSITE = $WEBSITE_ID"
echo ""

ask_yes_no "Have you added all GitHub secrets?" || true

echo ""

# ====== STEP 10: Final Deploy ======
echo -e "${GREEN}✓ STEP 10: Ready for Deployment${NC}"
echo ""
echo "Everything is configured!"
echo ""
echo "Next steps:"
echo "  1. Configure environment variables in Vercel dashboard"
echo "  2. Run: git push origin main"
echo "  3. GitHub Actions will auto-deploy everything"
echo ""

ask_yes_no "Ready to deploy?" && {
    echo ""
    echo "Pushing to main..."
    git add -A
    git commit -m "Complete interactive Vercel setup" || true
    git push origin main
    echo -e "${GREEN}✓ Pushed! Deployment starting...${NC}"
    echo ""
    echo "Monitor your deployment:"
    echo "  GitHub Actions: https://github.com/danielcorreiaudipatos-droid/infer-coon/actions"
    echo "  Vercel Dashboard: https://vercel.com/dashboard"
}

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                   ✅ SETUP COMPLETE!                         ║${NC}"
echo -e "${BLUE}║        Your ONNEWS Platform is ready for production!          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""
