import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';

@Injectable()
export class WalletService {
  constructor(private prisma: PrismaService) {}

  async getWallet(userId: string) {
    return this.prisma.wallet.findUnique({
      where: { userId },
    });
  }

  async getTransactions(userId: string, limit = 20, offset = 0) {
    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.transaction.count({ where: { userId } }),
    ]);

    return { transactions, total, limit, offset };
  }

  async creditWallet(userId: string, amount: number, type: string, description: string) {
    const wallet = await this.prisma.wallet.findUnique({ where: { userId } });

    const [updatedWallet, transaction] = await Promise.all([
      this.prisma.wallet.update({
        where: { userId },
        data: {
          balance: { increment: amount },
          totalEarned: { increment: amount },
        },
      }),
      this.prisma.transaction.create({
        data: {
          userId,
          walletId: wallet.id,
          type,
          amount,
          description,
          status: 'completed',
        },
      }),
    ]);

    return { wallet: updatedWallet, transaction };
  }
}
