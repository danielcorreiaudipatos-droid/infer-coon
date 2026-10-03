import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MarketplaceService {
  constructor(private prisma: PrismaService) {}

  async getProducts() {
    return this.prisma.marketplaceProduct.findMany({
      where: { isPublished: true },
      include: { creator: { select: { creatorName: true } } },
    });
  }

  async getById(id: string) {
    return this.prisma.marketplaceProduct.findUnique({
      where: { id },
      include: { creator: true },
    });
  }

  async createProduct(creatorId: string, data: any) {
    return this.prisma.marketplaceProduct.create({
      data: {
        creatorId,
        productType: data.productType,
        name: data.name,
        description: data.description,
        price: data.price,
        thumbnailUrl: data.thumbnailUrl,
        isPublished: true,
        publishedAt: new Date(),
      },
    });
  }

  async purchaseProduct(userId: string, productId: string) {
    const product = await this.prisma.marketplaceProduct.findUnique({
      where: { id: productId },
    });

    const price = Number(product!.price);
    const creatorEarnings = price * 0.7;
    const platformFee = price * 0.3;

    await this.prisma.marketplaceProduct.update({
      where: { id: productId },
      data: {
        totalSold: { increment: 1 },
        totalRevenue: { increment: product!.price },
      },
    });

    return this.prisma.marketplacePurchase.create({
      data: {
        userId,
        productId,
        creatorId: product!.creatorId,
        amount: product!.price,
        creatorEarnings,
        platformFee,
      },
    });
  }

  async getPurchases(userId: string) {
    return this.prisma.marketplacePurchase.findMany({
      where: { userId },
      include: { product: true },
    });
  }
}
