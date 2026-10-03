import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ContentService {
  constructor(private prisma: PrismaService) {}

  async getAll() {
    return this.prisma.creatorContent.findMany({
      where: { isPublished: true },
      include: { creator: { select: { creatorName: true } } },
    });
  }

  async getById(id: string) {
    return this.prisma.creatorContent.findUnique({
      where: { id },
      include: { creator: true },
    });
  }

  async create(creatorId: string, data: any) {
    return this.prisma.creatorContent.create({
      data: {
        creatorId,
        title: data.title,
        description: data.description,
        contentType: data.contentType,
        contentUrl: data.contentUrl,
        thumbnailUrl: data.thumbnailUrl,
        requiresSubscription: data.requiresSubscription || true,
        isPublished: true,
        publishedAt: new Date(),
      },
    });
  }

  async trackAccess(userId: string, contentId: string) {
    return this.prisma.contentAccess.upsert({
      where: { userId_contentId: { userId, contentId } },
      update: { accessedAt: new Date() },
      create: { userId, contentId },
    });
  }

  async hasAccess(userId: string, contentId: string) {
    const access = await this.prisma.contentAccess.findUnique({
      where: { userId_contentId: { userId, contentId } },
    });
    return { hasAccess: !!access };
  }
}
