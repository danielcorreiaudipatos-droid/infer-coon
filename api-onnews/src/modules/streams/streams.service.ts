import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';

@Injectable()
export class StreamsService {
  constructor(private prisma: PrismaService) {}

  async getCurrentStream() {
    return this.prisma.stream.findFirst({
      where: { isLive: true },
      include: { watchingSessions: { select: { id: true } } },
    });
  }

  async getSchedule(limit = 10) {
    return this.prisma.stream.findMany({
      where: { isLive: false, scheduledStart: { gt: new Date() } },
      orderBy: { scheduledStart: 'asc' },
      take: limit,
    });
  }

  async startWatching(userId: string, streamId: string) {
    return this.prisma.watchingSession.create({
      data: { userId, streamId },
    });
  }

  async endWatching(sessionId: string) {
    const session = await this.prisma.watchingSession.findUnique({
      where: { id: sessionId },
      include: { stream: true },
    });

    const endTime = new Date();
    const durationMinutes = (endTime.getTime() - session.startTime.getTime()) / 60000;
    const earnings = durationMinutes * session.stream.rewardPerMinute;

    return this.prisma.watchingSession.update({
      where: { id: sessionId },
      data: {
        endTime,
        durationMinutes,
        earnings,
        isCompleted: true,
      },
    });
  }

  async getUserStats(userId: string) {
    const sessions = await this.prisma.watchingSession.findMany({
      where: { userId, isCompleted: true },
    });

    const totalMinutes = sessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
    const totalEarnings = sessions.reduce((sum, s) => sum + (s.earnings || 0), 0);

    return {
      totalSessions: sessions.length,
      totalMinutesWatched: totalMinutes,
      totalEarnings,
      averageSessionDuration: sessions.length > 0 ? totalMinutes / sessions.length : 0,
    };
  }
}
