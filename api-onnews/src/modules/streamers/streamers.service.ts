import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';

@Injectable()
export class StreamersService {
  constructor(private prisma: PrismaService) {}

  async getStreamer(streamerId: string) {
    return this.prisma.streamer.findUnique({
      where: { id: streamerId },
      include: { followers: true },
    });
  }

  async getStreamerByUserId(userId: string) {
    return this.prisma.streamer.findUnique({
      where: { userId },
    });
  }

  async followStreamer(userId: string, streamerId: string) {
    return this.prisma.streamerFollower.create({
      data: { userId, streamerId },
    });
  }

  async getFollowers(streamerId: string) {
    return this.prisma.streamerFollower.findMany({
      where: { streamerId },
    });
  }
}
