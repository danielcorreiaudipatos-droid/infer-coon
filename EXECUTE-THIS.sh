#!/bin/bash

# ⚡ EXECUTE THIS ON YOUR LOCAL MACHINE
# This will set up everything in one go

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║         🚀 VERCEL COMPLETE SETUP - Execute Now               ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "⚠️  This script needs to run on YOUR local machine (not cloud)"
echo ""
echo "Steps:"
echo "1. Open terminal on your computer"
echo "2. Clone the repo:"
echo "   git clone https://github.com/danielcorreiaudipatos-droid/infer-coon.git"
echo "   cd infer-coon"
echo ""
echo "3. Run this command:"
echo "   bash quick-vercel-setup.sh"
echo ""
echo "✨ That's it! Everything will be set up automatically"
echo ""

# If running locally, this is what happens:
if command -v vercel &> /dev/null; then
    echo "✅ Vercel CLI is available"
    echo ""
    echo "To continue, you need to:"
    echo "1. Run: vercel login"
    echo "2. Complete the browser login"
    echo "3. Then run: bash quick-vercel-setup.sh"
else
    echo "Installing Vercel CLI..."
    npm install -g vercel
fi
