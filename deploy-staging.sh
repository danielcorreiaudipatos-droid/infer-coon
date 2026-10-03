#!/bin/bash

echo "🚀 ONGAME + COON STAGING DEPLOYMENT"
echo "====================================="
echo ""

# Check if Vercel is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm i -g vercel
fi

echo "✅ Vercel CLI ready"
echo ""

# Option 1: Check if already authenticated
if [ -f ~/.vercel/auth.json ]; then
    echo "✅ Found existing Vercel authentication"
    echo ""
    echo "🚀 Deploying OnGame staging..."
    vercel --prod --name ongame-staging 2>&1
    ONGAME_RESULT=$?
    
    echo ""
    echo "🚀 Deploying COON staging..."
    cd coon
    vercel --prod --name coon-staging 2>&1
    COON_RESULT=$?
    cd ..
    
    if [ $ONGAME_RESULT -eq 0 ] && [ $COON_RESULT -eq 0 ]; then
        echo ""
        echo "════════════════════════════════════"
        echo "✅ DEPLOYMENT SUCCESSFUL!"
        echo "════════════════════════════════════"
        echo ""
        echo "🎮 OnGame Staging:  https://ongame-staging.vercel.app"
        echo "🎮 COON Staging:    https://coon-staging.vercel.app"
        echo ""
        echo "⏱️  Both live in 2-5 minutes"
        echo "✨ Ready for testing!"
        exit 0
    else
        echo ""
        echo "❌ Deployment failed"
        exit 1
    fi
else
    echo "⚠️  Vercel authentication not found"
    echo ""
    echo "To authenticate, run:"
    echo "  vercel login"
    echo ""
    echo "Then run this script again:"
    echo "  bash deploy-staging.sh"
    exit 1
fi
