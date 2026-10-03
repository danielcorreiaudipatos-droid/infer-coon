import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getMyAnalytics(userId: string) {
    return this.prisma.userAnalytics.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 30,
    });
  }

  async getCreatorAnalytics(creatorId: string) {
    return this.prisma.creatorAnalytics.findMany({
      where: { creatorId },
      orderBy: { date: 'desc' },
      take: 30,
    });
  }

  async getDashboard() {
    const totalUsers = await this.prisma.user.count();
    const totalCreators = await this.prisma.creator.count();
    const activeSubscriptions = await this.prisma.userSubscription.count({
      where: { status: 'active' },
    });

    return {
      totalUsers,
      totalCreators,
      activeSubscriptions,
      timestamp: new Date(),
    };
  }
}
