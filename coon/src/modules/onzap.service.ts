import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@/services/prisma.service';
import { GAME_CONFIG, ANTI_CHEAT_CONFIG } from '@/config/games.config';
import * as crypto from 'crypto';

@Injectable()
export class ONZAPGameService {
  constructor(private prisma: PrismaService) {}

  async startGame(userId: string, deviceId: string) {
    // Check rate limiting
    const recentSessions = await this.prisma.gameSession.count({
      where: {
        userId,
        gameType: 'onzap',
        createdAt: {
          gte: new Date(Date.now() - 60 * 60 * 1000) // Last hour
        }
      }
    });

    if (recentSessions >= GAME_CONFIG.onzap.maxSessionsPerHour) {
      throw new BadRequestException('Too many games. Try again later.');
    }

    // Create session
    const session = await this.prisma.gameSession.create({
      data: {
        userId,
        gameType: 'onzap',
        status: 'playing',
        deviceId,
        clientVersion: '1.0.0',
      }
    });

    return {
      sessionId: session.id,
      startTime: session.startTime,
      config: {
        initialSpeed: GAME_CONFIG.onzap.initialSpeed,
        maxScore: GAME_CONFIG.onzap.maxScore,
        sessionTimeout: GAME_CONFIG.onzap.sessionTimeout,
      }
    };
  }

  async endGame(userId: string, sessionId: string, score: number) {
    // Get session
    const session = await this.prisma.gameSession.findFirst({
      where: {
        id: sessionId,
        userId,
        gameType: 'onzap'
      }
    });

    if (!session) {
      throw new ForbiddenException('Invalid session');
    }

    // Validate score
    const isValidScore = this.validateScore(score, session);
    if (!isValidScore) {
      await this.prisma.gameSession.update({
        where: { id: sessionId },
        data: { suspiciousFlag: true, status: 'finished' }
      });
      throw new BadRequestException('Invalid score detected');
    }

    // Calculate reward
    const reward = this.calculateReward(score);

    // Update session
    const updatedSession = await this.prisma.gameSession.update({
      where: { id: sessionId },
      data: {
        score,
        status: 'finished',
        endTime: new Date()
      }
    });

    // Create reward record
    const rewardRecord = await this.prisma.gameReward.create({
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
      reward: reward.cash,
      points: reward.points,
      totalReward: (reward.cash).toFixed(2)
    };
  }

  private validateScore(score: number, session: any): boolean {
    // Basic validation
    if (score < 0 || score > GAME_CONFIG.onzap.maxScore) {
      return false;
    }

    // Time-based validation
    const duration = Date.now() - session.createdAt.getTime();
    const maxExpectedScore = (duration / 1000) * GAME_CONFIG.onzap.antiCheat.maxScorePerSecond;
    if (score > maxExpectedScore * 1.5) {
      return false;
    }

    // Checksum validation (if enabled)
    if (ANTI_CHEAT_CONFIG.enabled && session.checksumData) {
      const computedChecksum = this.computeChecksum(score, session);
      if (computedChecksum !== session.checksumData) {
        return false;
      }
    }

    return true;
  }

  private computeChecksum(score: number, session: any): string {
    const data = `${session.id}:${score}:${session.createdAt.getTime()}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  private calculateReward(score: number): { cash: number; points: number } {
    const baseReward = score * GAME_CONFIG.onzap.rewardPerPoint;
    const cash = Math.min(
      Math.max(baseReward, GAME_CONFIG.onzap.rewards.minimumReward),
      GAME_CONFIG.onzap.rewards.maximumReward
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
          gameType: 'onzap',
          userId
        }
      }
    });

    if (existing) {
      const newScore = Math.max(existing.score, score);
      await this.prisma.gameLeaderboard.update({
        where: {
          gameType_userId: {
            gameType: 'onzap',
            userId
          }
        },
        data: {
          score: newScore,
          gamesPlayed: existing.gamesPlayed + 1,
          totalRewards: existing.totalRewards + score * GAME_CONFIG.onzap.rewardPerPoint
        }
      });
    } else {
      await this.prisma.gameLeaderboard.create({
        data: {
          gameType: 'onzap',
          userId,
          score,
          gamesPlayed: 1,
          totalRewards: score * GAME_CONFIG.onzap.rewardPerPoint
        }
      });
    }
  }

  async getLeaderboard(limit: number = 100) {
    const leaderboard = await this.prisma.gameLeaderboard.findMany({
      where: { gameType: 'onzap' },
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
          gameType: 'onzap',
          userId
        }
      }
    });

    const sessions = await this.prisma.gameSession.findMany({
      where: {
        userId,
        gameType: 'onzap',
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
