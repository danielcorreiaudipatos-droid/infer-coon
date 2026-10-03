/**
 * ONLOVE Mobile - Gamification Service
 * Features: Points, Levels, Achievements, Leaderboard
 * Week 1-2 Implementation
 * Revenue Impact: +R$ 700k MRR
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

interface PointsConfig {
  post: number; // 10 points
  comment: number; // 5 points
  like: number; // 1 point
  follow: number; // 50 points
  dailyLogin: number; // 5 bonus
}

interface LevelConfig {
  pointsPerLevel: number; // 100 points per level
  maxLevel: number; // 100 levels
}

@Injectable()
export class GamificationService {
  private pointsConfig: PointsConfig = {
    post: 10,
    comment: 5,
    like: 1,
    follow: 50,
    dailyLogin: 5,
  };

  private levelConfig: LevelConfig = {
    pointsPerLevel: 100,
    maxLevel: 100,
  };

  constructor(private prisma: PrismaService) {}

  /**
   * Award points to user for an action
   * Actions: post, comment, like, follow, daily_login
   */
  async awardPoints(
    userId: string,
    action: keyof PointsConfig,
    referenceId?: string,
  ): Promise<{
    pointsAwarded: number;
    totalPoints: number;
    levelUp: boolean;
    newLevel?: number;
  }> {
    const points = this.pointsConfig[action];

    if (!points) {
      throw new Error(`Invalid action: ${action}`);
    }

    // Record points in ledger
    await this.prisma.pointsLedger.create({
      data: {
        userId,
        points,
        action,
        referenceId,
        timestamp: new Date(),
      },
    });

    // Update user's total points
    const updatedLevel = await this.updateUserLevel(userId);

    return {
      pointsAwarded: points,
      totalPoints: updatedLevel.totalPoints,
      levelUp: updatedLevel.leveledUp,
      newLevel: updatedLevel.leveledUp ? updatedLevel.newLevel : undefined,
    };
  }

  /**
   * Update user level based on total points
   */
  private async updateUserLevel(
    userId: string,
  ): Promise<{
    totalPoints: number;
    currentLevel: number;
    leveledUp: boolean;
    newLevel?: number;
  }> {
    // Get all points for user
    const pointsEntries = await this.prisma.pointsLedger.findMany({
      where: { userId },
    });

    const totalPoints = pointsEntries.reduce(
      (sum, entry) => sum + entry.points,
      0,
    );

    // Calculate level
    const newLevel = Math.min(
      Math.floor(totalPoints / this.levelConfig.pointsPerLevel) + 1,
      this.levelConfig.maxLevel,
    );

    // Get current level
    let userLevel = await this.prisma.userLevel.findUnique({
      where: { userId },
    });

    const leveledUp = !userLevel || newLevel > userLevel.level;
    const oldLevel = userLevel?.level || 1;

    // Upsert user level
    userLevel = await this.prisma.userLevel.upsert({
      where: { userId },
      create: {
        userId,
        level: newLevel,
        totalPoints,
        nextLevelAt: newLevel * this.levelConfig.pointsPerLevel,
      },
      update: {
        level: newLevel,
        totalPoints,
        nextLevelAt: newLevel * this.levelConfig.pointsPerLevel,
      },
    });

    // Check for achievements
    if (leveledUp) {
      await this.checkAchievements(userId, newLevel, totalPoints);
    }

    return {
      totalPoints,
      currentLevel: newLevel,
      leveledUp,
      newLevel: leveledUp ? newLevel : undefined,
    };
  }

  /**
   * Check and unlock achievements
   */
  private async checkAchievements(
    userId: string,
    currentLevel: number,
    totalPoints: number,
  ): Promise<void> {
    // Define achievements
    const achievements = [
      { name: 'First Steps', requiredPoints: 100 },
      { name: 'Level 2 Reached', requiredPoints: 100 },
      { name: 'Level 5 Reached', requiredPoints: 500 },
      { name: 'Level 10 Reached', requiredPoints: 1000 },
      { name: 'Century Club', requiredPoints: 10000 },
    ];

    // Check each achievement
    for (const achConfig of achievements) {
      if (totalPoints >= achConfig.requiredPoints) {
        // Check if user already has this achievement
        const existingAch = await this.prisma.achievement.findFirst({
          where: { name: achConfig.name },
        });

        if (existingAch) {
          const userAch = await this.prisma.userAchievement.findFirst({
            where: {
              userId,
              achievementId: existingAch.id,
            },
          });

          // Unlock if not already unlocked
          if (!userAch) {
            await this.prisma.userAchievement.create({
              data: {
                userId,
                achievementId: existingAch.id,
              },
            });
          }
        }
      }
    }
  }

  /**
   * Get user's points and level info
   */
  async getUserLevel(userId: string): Promise<{
    level: number;
    totalPoints: number;
    nextLevelAt: number;
    pointsToNextLevel: number;
    progress: number; // 0-100
  }> {
    let userLevel = await this.prisma.userLevel.findUnique({
      where: { userId },
    });

    if (!userLevel) {
      userLevel = await this.prisma.userLevel.create({
        data: {
          userId,
          level: 1,
          totalPoints: 0,
          nextLevelAt: this.levelConfig.pointsPerLevel,
        },
      });
    }

    const pointsToNextLevel = userLevel.nextLevelAt - userLevel.totalPoints;
    const progress = Math.min(
      100,
      (userLevel.totalPoints % this.levelConfig.pointsPerLevel) / 100,
    );

    return {
      level: userLevel.level,
      totalPoints: userLevel.totalPoints,
      nextLevelAt: userLevel.nextLevelAt,
      pointsToNextLevel: Math.max(0, pointsToNextLevel),
      progress: Math.round(progress),
    };
  }

  /**
   * Get user's achievements
   */
  async getUserAchievements(userId: string): Promise<any[]> {
    return this.prisma.userAchievement.findMany({
      where: { userId },
      include: { achievement: true },
    });
  }

  /**
   * Get global leaderboard (top 100)
   */
  async getLeaderboard(limit = 100): Promise<any[]> {
    // Get all users with their levels
    const allUsers = await this.prisma.userLevel.findMany({
      orderBy: [{ totalPoints: 'desc' }, { updatedAt: 'desc' }],
      take: limit,
      include: {
        user: {
          select: { id: true, name: true },
        },
      },
    });

    // Create leaderboard with ranks
    return allUsers.map((user, index) => ({
      rank: index + 1,
      userId: user.userId,
      userName: user.user.name,
      level: user.level,
      points: user.totalPoints,
      badge: this.getBadgeForLevel(user.level),
    }));
  }

  /**
   * Get weekly leaderboard (last 7 days)
   */
  async getWeeklyLeaderboard(limit = 100): Promise<any[]> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Get points earned in last 7 days
    const weeklyPoints = await this.prisma.pointsLedger.groupBy({
      by: ['userId'],
      where: {
        timestamp: { gte: sevenDaysAgo },
      },
      _sum: {
        points: true,
      },
      orderBy: {
        _sum: {
          points: 'desc',
        },
      },
      take: limit,
    });

    // Get user info and levels
    const leaderboard = await Promise.all(
      weeklyPoints.map(async (entry, index) => {
        const user = await this.prisma.user.findUnique({
          where: { id: entry.userId },
        });

        const level = await this.prisma.userLevel.findUnique({
          where: { userId: entry.userId },
        });

        return {
          rank: index + 1,
          userId: entry.userId,
          userName: user?.name,
          weeklyPoints: entry._sum.points || 0,
          currentLevel: level?.level || 1,
        };
      }),
    );

    return leaderboard;
  }

  /**
   * Get badge based on level
   */
  private getBadgeForLevel(level: number): string {
    if (level >= 50) return '👑';
    if (level >= 25) return '💎';
    if (level >= 10) return '🏆';
    if (level >= 5) return '⭐';
    return '🌟';
  }

  /**
   * Initialize achievements for a new product
   */
  async initializeAchievements(): Promise<void> {
    const achievements = [
      {
        name: 'First Steps',
        description: 'Earn your first 100 points',
        icon: '🚀',
        requiredPoints: 100,
        category: 'milestone',
      },
      {
        name: 'Level 2 Reached',
        description: 'Reach level 2',
        icon: '⭐',
        requiredPoints: 100,
        category: 'level',
      },
      {
        name: 'Level 5 Reached',
        description: 'Reach level 5',
        icon: '🎯',
        requiredPoints: 500,
        category: 'level',
      },
      {
        name: 'Level 10 Reached',
        description: 'Reach level 10',
        icon: '🏆',
        requiredPoints: 1000,
        category: 'level',
      },
      {
        name: 'Century Club',
        description: 'Earn 10,000 points',
        icon: '👑',
        requiredPoints: 10000,
        category: 'milestone',
      },
    ];

    for (const ach of achievements) {
      await this.prisma.achievement.upsert({
        where: { name: ach.name },
        create: ach,
        update: ach,
      });
    }
  }

  /**
   * Get gamification stats
   */
  async getGamificationStats(userId: string): Promise<{
    totalPoints: number;
    currentLevel: number;
    totalAchievements: number;
    leaderboardRank: number;
    lastAction: string;
    lastActionTime: Date;
  }> {
    const userLevel = await this.prisma.userLevel.findUnique({
      where: { userId },
    });

    const achievements = await this.prisma.userAchievement.findMany({
      where: { userId },
    });

    const lastPointEntry = await this.prisma.pointsLedger.findFirst({
      where: { userId },
      orderBy: { timestamp: 'desc' },
    });

    // Get rank in leaderboard
    const usersAbove = await this.prisma.userLevel.count({
      where: {
        totalPoints: {
          gt: userLevel?.totalPoints || 0,
        },
      },
    });

    return {
      totalPoints: userLevel?.totalPoints || 0,
      currentLevel: userLevel?.level || 1,
      totalAchievements: achievements.length,
      leaderboardRank: usersAbove + 1,
      lastAction: lastPointEntry?.action || 'none',
      lastActionTime: lastPointEntry?.timestamp || new Date(),
    };
  }
}
