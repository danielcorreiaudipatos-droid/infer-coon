import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';

@Injectable()
export class LeaderboardService {
  constructor(private prisma: PrismaService) {}

  async getLeaderboard(period = 'all_time', limit = 20) {
    return this.prisma.leaderboardEntry.findMany({
      where: { period },
      orderBy: { rank: 'asc' },
      take: limit,
    });
  }

  async getUserRank(userId: string, period = 'all_time') {
    return this.prisma.leaderboardEntry.findFirst({
      where: { userId, period },
    });
  }
}
