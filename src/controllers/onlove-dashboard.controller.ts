import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { AssasService } from '../services/assas.service';
import { CacheService } from '../services/cache.service';
import { EmailService } from '../services/email.service';

@Controller('api/onlove')
@UseGuards(JwtAuthGuard)
export class OnloveDashboardController {
  constructor(
    private assas: AssasService,
    private cache: CacheService,
    private email: EmailService,
  ) {}

  @Get('dashboard')
  async getDashboard(@Req() req) {
    const userId = req.user.id;
    const cacheKey = `onlove:dashboard:${userId}`;

    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;

    const dashboard = {
      userId,
      earnings: {
        thisMonth: 2500,
        thisYear: 28000,
        allTime: 45000,
        daysToR1k: 5,
      },
      subscribers: {
        total: 2500,
        paid: 150,
        growth: '+12%',
      },
      community: {
        name: 'My Awesome Community',
        members: 2500,
        engagement: 4.2,
      },
      revenueStreams: [
        { type: 'subscriptions', amount: 1200 },
        { type: 'products', amount: 800 },
        { type: 'tips', amount: 300 },
        { type: 'affiliations', amount: 200 },
      ],
    };

    await this.cache.set(cacheKey, dashboard, 300);
    return dashboard;
  }

  @Post('request-payout')
  async requestPayout(
    @Body() dto: { amount: number; bankAccount: any },
    @Req() req,
  ) {
    const userId = req.user.id;

    // Create Assas customer if not exists
    const customer = await this.assas.createCustomer({
      name: req.user.name,
      email: req.user.email,
      cpfCnpj: dto.bankAccount.cpf,
    });

    // Create transfer/payout
    const transfer = await this.assas.createTransfer({
      customerId: customer.id,
      amount: dto.amount,
      bankAccount: dto.bankAccount,
    });

    // Send notification
    await this.email.sendEmail({
      to: req.user.email,
      subject: 'Payout Requested',
      html: `<p>Payout of R$ ${dto.amount} requested. Status: ${transfer.status}</p>`,
      tags: ['onlove', 'payout'],
    });

    // Invalidate cache
    await this.cache.invalidatePattern(`onlove:dashboard:${userId}`);

    return { success: true, payoutId: transfer.id };
  }

  @Get('gamification')
  async getGamification(@Req() req) {
    const cacheKey = `onlove:gamification:${req.user.id}`;

    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;

    const gamification = {
      level: 5,
      points: 2500,
      nextLevel: 3000,
      streak: 12,
      badges: ['First Post', 'Influencer', '1K Members', 'Top Creator'],
      leaderboard: [
        { rank: 1, name: 'Top Creator', points: 5000 },
        { rank: 2, name: 'Growing Star', points: 3500 },
        { rank: 3, name: req.user.name, points: 2500 },
      ],
    };

    await this.cache.set(cacheKey, gamification, 600);
    return gamification;
  }
}
