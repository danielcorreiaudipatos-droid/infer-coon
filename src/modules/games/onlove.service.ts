import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@/services/prisma.service';
import { GAME_CONFIG } from '@/config/games.config';

@Injectable()
export class ONLOVEGameService {
  constructor(private prisma: PrismaService) {}

  async startGame(userId: string, deviceId: string) {
    // Check rate limiting
    const recentSessions = await this.prisma.gameSession.count({
      where: {
        userId,
        gameType: 'onlove',
        createdAt: {
          gte: new Date(Date.now() - 60 * 60 * 1000)
        }
      }
    });

    if (recentSessions >= GAME_CONFIG.onlove.maxSessionsPerHour) {
      throw new BadRequestException('Too many games. Try again later.');
    }

    const session = await this.prisma.gameSession.create({
      data: {
        userId,
        gameType: 'onlove',
        status: 'playing',
        deviceId,
        clientVersion: '1.0.0',
      }
    });

    return {
      sessionId: session.id,
      startTime: session.startTime,
      config: {
        profilesPerSession: GAME_CONFIG.onlove.profilesPerSession,
        sessionTimeout: GAME_CONFIG.onlove.sessionTimeout,
      }
    };
  }

  async endGame(userId: string, sessionId: string, score: number, matches: number, profilesViewed: number) {
    // Validate session
    const session = await this.prisma.gameSession.findFirst({
      where: {
        id: sessionId,
        userId,
        gameType: 'onlove'
      }
    });

    if (!session) {
      throw new ForbiddenException('Invalid session');
    }

    // Validate score
    const isValidScore = this.validateScore(score, matches, profilesViewed, session);
    if (!isValidScore) {
      await this.prisma.gameSession.update({
        where: { id: sessionId },
        data: { suspiciousFlag: true, status: 'finished' }
      });
      throw new BadRequestException('Invalid score detected');
    }

    // Calculate reward
    const reward = this.calculateReward(score, matches);

    // Update session
    await this.prisma.gameSession.update({
      where: { id: sessionId },
      data: {
        score,
        status: 'finished',
        endTime: new Date()
      }
    });

    // Create reward
    await this.prisma.gameReward.create({
      data: {
        gameSessionId: sessionId,
        userId,
        rewardType: 'cash',
        rewardValue: reward.cash
      }
    });

    // Update leaderboard
    await this.updateLeaderboard(userId, score);

    return {
      sessionId,
      score,
      matches,
      reward: reward.cash,
      points: reward.points,
      totalReward: (reward.cash).toFixed(2)
    };
  }

  private validateScore(score: number, matches: number, profilesViewed: number, session: any): boolean {
    // Basic validation
    if (score < 0 || matches < 0 || profilesViewed < 0) {
      return false;
    }

    // Match validation (can't have more matches than profiles viewed)
    if (matches > profilesViewed) {
      return false;
    }

    // Duration validation
    const duration = Date.now() - session.createdAt.getTime();
    const expectedMaxMatches = Math.min(profilesViewed, Math.floor((duration / 1000) * 0.5)); // Max 1 match per 2 sec
    if (matches > expectedMaxMatches * 1.5) {
      return false;
    }

    return true;
  }

  private calculateReward(score: number, matches: number): { cash: number; points: number } {
    const matchBonus = matches * GAME_CONFIG.onlove.rewards.perMatch;
    const scoreBonus = score * 0.01; // R$ 0.01 per score point
    const baseReward = matchBonus + scoreBonus;

    const cash = Math.min(
      Math.max(baseReward, 1.0),
      GAME_CONFIG.onlove.rewards.maximumReward
    );
    const points = Math.floor(score / 10);

    return {
      cash: parseFloat(cash.toFixed(2)),
      points
    };
  }

  private async updateLeaderboard(userId: string, score: number) {
    const existing = await this.prisma.gameLeaderboard.findUnique({
      where: {
        gameType_userId: {
          gameType: 'onlove',
          userId
        }
      }
    });

    if (existing) {
      const newScore = Math.max(existing.score, score);
      await this.prisma.gameLeaderboard.update({
        where: {
          gameType_userId: {
            gameType: 'onlove',
            userId
          }
        },
        data: {
          score: newScore,
          gamesPlayed: existing.gamesPlayed + 1,
          totalRewards: existing.totalRewards + (score * 0.01)
        }
      });
    } else {
      await this.prisma.gameLeaderboard.create({
        data: {
          gameType: 'onlove',
          userId,
          score,
          gamesPlayed: 1,
          totalRewards: score * 0.01
        }
      });
    }
  }

  async getLeaderboard(limit: number = 100) {
    const leaderboard = await this.prisma.gameLeaderboard.findMany({
      where: { gameType: 'onlove' },
      orderBy: { score: 'desc' },
      take: limit,
      include: {
        user: {
          select: { id: true, name: true, picture: true }
        }
      }
    });

    return leaderboard.map((entry, index) => ({
      rank: index + 1,
      userId: entry.userId,
      name: entry.user.name,
      avatar: entry.user.picture,
      score: entry.score,
      gamesPlayed: entry.gamesPlayed,
      totalRewards: entry.totalRewards.toFixed(2)
    }));
  }

  async getUserStats(userId: string) {
    const leaderboard = await this.prisma.gameLeaderboard.findUnique({
      where: {
        gameType_userId: {
          gameType: 'onlove',
          userId
        }
      }
    });

    const sessions = await this.prisma.gameSession.findMany({
      where: {
        userId,
        gameType: 'onlove',
        status: 'finished'
      },
      select: { score: true }
    });

    const bestScore = sessions.length > 0 ? Math.max(...sessions.map(s => s.score)) : 0;
    const averageScore = sessions.length > 0 ? sessions.reduce((a, b) => a + b.score, 0) / sessions.length : 0;

    return {
      rank: leaderboard?.rank || 0,
      score: leaderboard?.score || 0,
      gamesPlayed: leaderboard?.gamesPlayed || 0,
      totalRewards: (leaderboard?.totalRewards || 0).toFixed(2),
      bestScore,
      averageScore: parseFloat(averageScore.toFixed(2))
    };
  }
}
