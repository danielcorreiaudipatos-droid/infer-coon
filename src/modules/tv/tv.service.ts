import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@/services/prisma.service';

@Injectable()
export class TVService {
  constructor(private prisma: PrismaService) {}

  // Get current live stream
  async getCurrentStream() {
    const stream = await this.prisma.tvStream.findFirst({
      where: { is_live: true },
      orderBy: { started_at: 'desc' },
    });
    return stream;
  }

  // Get schedule (next 24h)
  async getSchedule(limit: number = 24) {
    return await this.prisma.tvStream.findMany({
      orderBy: { started_at: 'asc' },
      take: limit,
    });
  }

  // Start watching (log session)
  async startWatching(userId: string, streamId: string) {
    const stream = await this.prisma.tvStream.findUnique({
      where: { id: streamId },
    });

    if (!stream) throw new BadRequestException('Stream not found');

    return await this.prisma.watchingSession.create({
      data: {
        user_id: userId,
        stream_id: streamId,
        start_time: new Date(),
        earnings: 0,
      },
    });
  }

  // End watching (calculate earnings + add to wallet)
  async endWatching(userId: string, sessionId: string) {
    const session = await this.prisma.watchingSession.findFirst({
      where: { id: sessionId, user_id: userId },
    });

    if (!session) throw new ForbiddenException('Session not found');

    const stream = await this.prisma.tvStream.findUnique({
      where: { id: session.stream_id },
    });

    const endTime = new Date();
    const durationMinutes = (endTime.getTime() - session.start_time.getTime()) / 60000;
    const earnings = durationMinutes * stream.reward_per_min;

    // Update session
    await this.prisma.watchingSession.update({
      where: { id: sessionId },
      data: { end_time: endTime, earnings },
    });

    // Add to wallet
    await this.prisma.user.update({
      where: { id: userId },
      data: { wallet_balance: { increment: earnings } },
    });

    // Log transaction
    await this.prisma.transaction.create({
      data: {
        user_id: userId,
        type: 'earn',
        amount: earnings,
        source: 'tv_watching',
      },
    });

    return { earnings, session_id: sessionId };
  }

  // User TV stats
  async getUserStats(userId: string) {
    const sessions = await this.prisma.watchingSession.findMany({
      where: { user_id: userId },
    });

    const totalEarnings = sessions.reduce((sum, s) => sum + s.earnings, 0);
    const totalMinutes = sessions.reduce((sum, s) => {
      if (s.end_time) {
        return sum + (s.end_time.getTime() - s.start_time.getTime()) / 60000;
      }
      return sum;
    }, 0);

    return {
      total_earnings: totalEarnings,
      total_minutes: Math.round(totalMinutes),
      sessions: sessions.length,
    };
  }

  // TV Leaderboard
  async getLeaderboard(limit: number = 100) {
    const topWatchers = await this.prisma.watchingSession.groupBy({
      by: ['user_id'],
      _sum: { earnings: true },
      orderBy: { _sum: { earnings: 'desc' } },
      take: limit,
    });

    return Promise.all(
      topWatchers.map(async (entry, i) => {
        const user = await this.prisma.user.findUnique({
          where: { id: entry.user_id },
          select: { id: true, name: true, avatar: true },
        });
        return {
          rank: i + 1,
          user_id: entry.user_id,
          name: user?.name || 'Anonymous',
          earnings: entry._sum.earnings || 0,
        };
      })
    );
  }

  // Get quotes (IBOV, dólar, BTC)
  async getQuotes() {
    return await this.prisma.quote.findMany({
      orderBy: { updated_at: 'desc' },
      take: 10,
    });
  }
}
