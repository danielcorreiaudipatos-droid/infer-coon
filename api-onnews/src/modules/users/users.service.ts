import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getUserProfile(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        profilePictureUrl: true,
        bio: true,
        isVerified: true,
        createdAt: true,
        wallet: {
          select: {
            balance: true,
            totalEarned: true,
            totalWithdrawn: true,
          },
        },
        userAnalytics: true,
      },
    });
  }

  async updateProfile(userId: string, data: any) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
    });
  }
}
