import { Injectable } from '@nestjs/common';
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
