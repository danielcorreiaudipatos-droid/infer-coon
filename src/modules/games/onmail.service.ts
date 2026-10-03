import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@/services/prisma.service';
import { GAME_CONFIG } from '@/config/games.config';

@Injectable()
export class ONMAILGameService {
  constructor(private prisma: PrismaService) {}

  async startGame(userId: string, deviceId: string) {
    // Check rate limiting
    const recentSessions = await this.prisma.gameSession.count({
      where: {
        userId,
        gameType: 'onmail',
        createdAt: {
          gte: new Date(Date.now() - 60 * 60 * 1000)
        }
      }
    });

    if (recentSessions >= GAME_CONFIG.onmail.maxSessionsPerHour) {
      throw new BadRequestException('Too many games. Try again later.');
    }

    const session = await this.prisma.gameSession.create({
      data: {
        userId,
        gameType: 'onmail',
        status: 'playing',
        deviceId,
        clientVersion: '1.0.0',
      }
    });

    return {
      sessionId: session.id,
      startTime: session.startTime,
      config: {
        gridSize: GAME_CONFIG.onmail.gridSize,
        maxWaves: GAME_CONFIG.onmail.maxWaves,
        initialGold: GAME_CONFIG.onmail.initialGold,
        sessionTimeout: GAME_CONFIG.onmail.sessionTimeout,
        towers: GAME_CONFIG.onmail.towers
      }
    };
  }

  async endGame(userId: string, sessionId: string, score: number, wavesCompleted: number, towersBuilt: number) {
    // Validate session
    const session = await this.prisma.gameSession.findFirst({
      where: {
        id: sessionId,
        userId,
        gameType: 'onmail'
      }
    });

    if (!session) {
      throw new ForbiddenException('Invalid session');
    }

    // Validate game state
    const isValidScore = this.validateScore(score, wavesCompleted, session);
    if (!isValidScore) {
      await this.prisma.gameSession.update({
        where: { id: sessionId },
        data: { suspiciousFlag: true, status: 'finished' }
      });
      throw new BadRequestException('Invalid score detected');
    }

    // Calculate reward
    const reward = this.calculateReward(score, wavesCompleted);

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
      wavesCompleted,
      reward: reward.cash,
      points: reward.points,
      totalReward: (reward.cash).toFixed(2)
    };
  }

  private validateScore(score: number, wavesCompleted: number, session: any): boolean {
    // Basic validation
    if (score < 0 || wavesCompleted < 0 || wavesCompleted > 20) {
      return false;
    }

    // Duration validation (min ~30s per wave for endgame)
    const duration = Date.now() - session.createdAt.getTime();
    const minExpectedDuration = wavesCompleted * 10000; // 10 seconds per wave minimum
    if (duration < minExpectedDuration * 0.5) {
      return false;
    }

    // Score validation (should correlate with waves)
    const minExpectedScore = wavesCompleted * 100;
    const maxExpectedScore = wavesCompleted * 1000 + 10000;
    if (score < minExpectedScore || score > maxExpectedScore) {
      return false;
    }

    return true;
  }

  private calculateReward(score: number, wavesCompleted: number): { cash: number; points: number } {
    const waveBonus = wavesCompleted * GAME_CONFIG.onmail.rewards.perWave;
    const scoreBonus = score * 0.005; // R$ 0.005 per score point
    let baseReward = waveBonus + scoreBonus;

    // Perfection bonus (all 20 waves)
    if (wavesCompleted === 20) {
      baseReward += GAME_CONFIG.onmail.rewards.perfectionBonus;
    }

    const cash = Math.min(
      Math.max(baseReward, 1.0),
      GAME_CONFIG.onmail.rewards.maximumReward
    );
    const points = wavesCompleted * 10;

    return {
      cash: parseFloat(cash.toFixed(2)),
      points
    };
  }

  private async updateLeaderboard(userId: string, score: number) {
    const existing = await this.prisma.gameLeaderboard.findUnique({
      where: {
        gameType_userId: {
          gameType: 'onmail',
          userId
        }
      }
    });

    if (existing) {
      const newScore = Math.max(existing.score, score);
      await this.prisma.gameLeaderboard.update({
        where: {
          gameType_userId: {
            gameType: 'onmail',
            userId
          }
        },
        data: {
          score: newScore,
          gamesPlayed: existing.gamesPlayed + 1,
          totalRewards: existing.totalRewards + (score * 0.005)
        }
      });
    } else {
      await this.prisma.gameLeaderboard.create({
        data: {
          gameType: 'onmail',
          userId,
          score,
          gamesPlayed: 1,
          totalRewards: score * 0.005
        }
      });
    }
  }

  async getLeaderboard(limit: number = 100) {
    const leaderboard = await this.prisma.gameLeaderboard.findMany({
      where: { gameType: 'onmail' },
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
          gameType: 'onmail',
          userId
        }
      }
    });

    const sessions = await this.prisma.gameSession.findMany({
      where: {
        userId,
        gameType: 'onmail',
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
