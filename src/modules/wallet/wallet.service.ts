import { Injectable } from '@nestjs/common';
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
