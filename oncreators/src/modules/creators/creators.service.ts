import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CreatorsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.creator.findMany({
      include: { user: { select: { email: true, username: true } } },
    });
  }

  async findById(id: string) {
    return this.prisma.creator.findUnique({
      where: { id },
      include: { user: true },
    });
  }

  async create(userId: string, data: any) {
    return this.prisma.creator.create({
      data: {
        userId,
        creatorName: data.creatorName,
        description: data.description,
      },
    });
  }

  async getStats(id: string) {
    const creator = await this.prisma.creator.findUnique({
      where: { id },
      include: {
        followers: true,
        content: true,
      },
    });

    return {
      followersCount: creator.followers.length,
      contentCount: creator.content.length,
      totalEarnings: creator.totalEarnings,
    };
  }
}
