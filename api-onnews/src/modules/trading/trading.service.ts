import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';

@Injectable()
export class TradingService {
  constructor(private prisma: PrismaService) {}

  async getTradingAccount(userId: string) {
    return this.prisma.tradingAccount.findUnique({
      where: { userId },
    });
  }

  async makePrediction(userId: string, data: any) {
    const account = await this.prisma.tradingAccount.findUnique({
      where: { userId },
    });

    return this.prisma.tradingPrediction.create({
      data: {
        userId,
        accountId: account.id,
        symbol: data.symbol,
        prediction: data.prediction,
        entryPrice: data.entryPrice,
        quantity: data.quantity,
        stakeAmount: data.stakeAmount,
        expectedEarning: 0.50,
        timeFrame: data.timeFrame || '1m',
      },
    });
  }

  async getPredictions(userId: string, limit = 20) {
    return this.prisma.tradingPrediction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
