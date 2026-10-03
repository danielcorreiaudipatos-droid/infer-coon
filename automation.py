#!/usr/bin/env python3
"""
AUTOMATION SCRIPT - Gera tudo automaticamente para OnGame e COON
Uso: python3 automation.py
"""

import os
import shutil
from pathlib import Path

def create_cosmetics_shop():
    """Create cosmetics shop component"""
    code = '''import React, { useState } from 'react';

interface Cosmetic {
  id: string;
  name: string;
  price: number;
  icon: string;
  owned: boolean;
  category: 'skin' | 'effect' | 'theme';
}

export default function CosmeticsShop({ walletBalance }: { walletBalance: number }) {
  const [cosmetics] = useState<Cosmetic[]>([
    { id: 's1', name: 'Skin Ninja', price: 4.99, icon: '🥷', owned: true, category: 'skin' },
    { id: 's2', name: 'Skin Gold', price: 4.99, icon: '👑', owned: false, category: 'skin' },
    { id: 's3', name: 'Cyberpunk', price: 9.99, icon: '🤖', owned: false, category: 'skin' },
    { id: 'e1', name: 'Glow Effect', price: 2.99, icon: '✨', owned: true, category: 'effect' },
    { id: 'e2', name: 'Fire Effect', price: 2.99, icon: '🔥', owned: false, category: 'effect' },
    { id: 't1', name: 'Dark Theme', price: 1.99, icon: '🌙', owned: true, category: 'theme' },
  ]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h2 className="text-3xl font-bold text-white mb-8">🛍️ Cosmetics Shop</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cosmetics.map(item => (
          <div key={item.id} className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-center hover:border-purple-500 transition">
            <div className="text-4xl mb-3">{item.icon}</div>
            <h3 className="text-white font-semibold text-sm mb-2">{item.name}</h3>
            
            {item.owned ? (
              <div className="bg-green-600 text-white text-xs font-bold py-2 rounded-lg">✓ Owned</div>
            ) : (
              <>
                <p className="text-gray-400 text-sm mb-2">R$ {item.price.toFixed(2)}</p>
                <button 
                  disabled={walletBalance < item.price}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold py-2 rounded-lg hover:scale-105 disabled:opacity-50 transition"
                >
                  Comprar
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
'''
    path = Path('src/components/shop/CosmeticsShop.tsx')
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(code)
    print(f"✅ Created {path}")

def create_wallet_service():
    """Create wallet integration service"""
    code = '''import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/services/prisma.service';

@Injectable()
export class WalletService {
  constructor(private prisma: PrismaService) {}

  async getBalance(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { walletBalance: true }
    });
    return user?.walletBalance || 0;
  }

  async addReward(userId: string, amount: number, source: string) {
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { walletBalance: { increment: amount } }
    });

    // Log transaction
    await this.prisma.transaction.create({
      data: { userId, amount, type: 'reward', source }
    });

    return updated.walletBalance;
  }

  async requestWithdrawal(userId: string, amount: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { walletBalance: true }
    });

    if (!user || user.walletBalance < amount) {
      throw new Error('Insufficient balance');
    }

    // Create withdrawal request
    const withdrawal = await this.prisma.withdrawal.create({
      data: {
        userId,
        amount,
        status: 'pending',
        requestedAt: new Date()
      }
    });

    // Deduct from wallet
    await this.prisma.user.update({
      where: { id: userId },
      data: { walletBalance: { decrement: amount } }
    });

    return withdrawal;
  }
}
'''
    path = Path('src/modules/wallet/wallet.service.ts')
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(code)
    print(f"✅ Created {path}")

def create_analytics_service():
    """Create analytics service"""
    code = '''import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/services/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async trackEvent(userId: string, event: string, data: any) {
    // Track user events for analytics
    await this.prisma.event.create({
      data: { userId, event, data, timestamp: new Date() }
    });
  }

  async getDailyActiveUsers() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return this.prisma.gameSession.findMany({
      where: { createdAt: { gte: today } },
      distinct: ['userId']
    }).then(sessions => new Set(sessions.map(s => s.userId)).size);
  }

  async getARPU(days: number = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const rewards = await this.prisma.gameReward.aggregate({
      where: { createdAt: { gte: since } },
      _sum: { rewardValue: true }
    });

    const users = await this.prisma.user.count();
    return (rewards._sum.rewardValue || 0) / (users || 1);
  }

  async getRetentionRate(dayNumber: number = 7) {
    const since = new Date();
    since.setDate(since.getDate() - dayNumber);
    
    const cohort = await this.prisma.user.count({
      where: { createdAt: { gte: since } }
    });

    const retained = await this.prisma.gameSession.findMany({
      where: { createdAt: { gte: since } },
      distinct: ['userId']
    });

    return (retained.length / (cohort || 1)) * 100;
  }
}
'''
    path = Path('src/modules/analytics/analytics.service.ts')
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(code)
    print(f"✅ Created {path}")

def create_replication_script():
    """Create COON replication script"""
    script = '''#!/bin/bash
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
'''
    path = Path('replicate-coon.sh')
    path.write_text(script)
    os.chmod(path, 0o755)
    print(f"✅ Created {path}")

def main():
    print("🚀 Running automation script...\n")
    
    create_cosmetics_shop()
    create_wallet_service()
    create_analytics_service()
    create_replication_script()
    
    print("\n✅ Automation complete!")
    print("📝 Next steps:")
    print("   1. git add -A && git commit -m 'Phase A: Complete - Cosmetics, Wallet, Analytics'")
    print("   2. bash replicate-coon.sh  (for COON)")
    print("   3. Deploy to staging!")

if __name__ == '__main__':
    main()
