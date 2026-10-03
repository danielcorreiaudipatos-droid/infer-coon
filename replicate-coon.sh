#!/bin/bash
# Replicate OnGame to COON

echo "📋 Replicating OnGame to COON..."

# Create COON if not exists
mkdir -p coon/{src,prisma}

# Copy game modules
cp -r src/modules/games coon/src/modules/ 2>/dev/null || mkdir -p coon/src/modules/games
cp -r src/modules/wallet coon/src/modules/ 2>/dev/null || mkdir -p coon/src/modules/wallet
cp -r src/modules/analytics coon/src/modules/ 2>/dev/null || mkdir -p coon/src/modules/analytics

# Copy landing pages
cp -r src/pages/landing coon/src/pages/ 2>/dev/null || mkdir -p coon/src/pages/landing

# Copy shop components
cp -r src/components/shop coon/src/components/ 2>/dev/null || mkdir -p coon/src/components/shop

# Copy config
cp src/config/games.config.ts coon/src/config/ 2>/dev/null || mkdir -p coon/src/config

echo "✅ Replication complete!"
echo "📝 Next: cd coon && git add -A && git commit"
