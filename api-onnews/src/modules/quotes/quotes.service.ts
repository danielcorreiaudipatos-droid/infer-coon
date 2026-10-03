import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';

@Injectable()
export class QuotesService {
  constructor(private prisma: PrismaService) {}

  async getQuotes() {
    return this.prisma.quote.findMany({
      select: {
        symbol: true,
        name: true,
        price: true,
        changePercent: true,
        lastUpdated: true,
      },
    });
  }

  async getQuoteHistory(symbol: string, limit = 100) {
    return this.prisma.quoteHistory.findMany({
      where: { symbol },
      orderBy: { recordedAt: 'desc' },
      take: limit,
    });
  }

  async updateQuotes(quotes: any[]) {
    return Promise.all(
      quotes.map(quote =>
        this.prisma.quote.upsert({
          where: { symbol: quote.symbol },
          update: {
            price: quote.price,
            changePercent: quote.changePercent,
            lastUpdated: new Date(),
          },
          create: {
            symbol: quote.symbol,
            name: quote.name,
            price: quote.price,
            changePercent: quote.changePercent,
          },
        }),
      ),
    );
  }
}
