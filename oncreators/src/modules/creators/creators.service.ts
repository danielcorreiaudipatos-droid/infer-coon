import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CreatorsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.creator.findMany({
      include: {
        user: { select: { email: true, username: true } },
        _count: {
          select: { followers: true, content: true },
        },
      },
    });
  }

  async findById(id: string) {
    const creator = await this.prisma.creator.findUnique({
      where: { id },
      include: {
        user: true,
        _count: { select: { followers: true, content: true } },
      },
    });

    if (!creator) {
      throw new NotFoundException('Creator not found');
    }

    return creator;
  }

  async create(userId: string, data: any) {
    return this.prisma.creator.create({
      data: {
        userId,
        creatorName: data.creatorName,
        description: data.description,
        profileImageUrl: data.profileImageUrl,
      },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.creator.update({
      where: { id },
      data: {
        description: data.description,
        profileImageUrl: data.profileImageUrl,
        websiteUrl: data.websiteUrl,
      },
    });
  }

  async follow(userId: string, creatorId: string) {
    const existing = await this.prisma.creatorFollower.findUnique({
      where: { userId_creatorId: { userId, creatorId } },
    });

    if (existing) {
      return { message: 'Already following' };
    }

    await this.prisma.creatorFollower.create({
      data: { userId, creatorId },
    });

    await this.prisma.creator.update({
      where: { id: creatorId },
      data: { followersCount: { increment: 1 } },
    });

    return { message: 'Followed successfully' };
  }

  async getStats(id: string) {
    const creator = await this.prisma.creator.findUnique({
      where: { id },
      include: {
        followers: true,
        content: true,
      },
    });

    if (!creator) {
      throw new NotFoundException('Creator not found');
    }

    return {
      followersCount: creator.followers.length,
      contentCount: creator.content.length,
      totalEarnings: creator.totalEarnings,
      avgRating: creator.avgRating,
      isVerified: creator.isVerified,
    };
  }
}
