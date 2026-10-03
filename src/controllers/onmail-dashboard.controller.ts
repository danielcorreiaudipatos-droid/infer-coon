import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { EmailService } from '../services/email.service';
import { CacheService } from '../services/cache.service';
import { PrismaService } from '../database/prisma.service';

@Controller('api/onmail')
@UseGuards(JwtAuthGuard)
export class OnmailDashboardController {
  constructor(
    private email: EmailService,
    private cache: CacheService,
    private prisma: PrismaService,
  ) {}

  @Get('dashboard')
  async getDashboard(@Req() req) {
    const userId = req.user.id;
    const cacheKey = `onmail:dashboard:${userId}`;

    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;

    const dashboard = {
      userId,
      metrics: {
        subscribers: 2500,
        emailsSent: 15000,
        openRate: 28.5,
        clickRate: 4.2,
        unsubscribeRate: 0.8,
        estimatedRevenue: 1260,
      },
      campaigns: [
        {
          id: 'camp_1',
          name: 'Welcome Series',
          status: 'active',
          opens: 700,
          clicks: 105,
          revenue: 1260,
          roi: '6200%',
        },
      ],
      cost: {
        perEmail: 0.008,
        monthlyBudget: 20,
        estimatedRevenue: 1260,
      },
    };

    await this.cache.set(cacheKey, dashboard, 300);
    return dashboard;
  }

  @Post('send-campaign')
  async sendCampaign(
    @Body() dto: {
      name: string;
      subject: string;
      html: string;
      segment: string;
    },
    @Req() req,
  ) {
    const userId = req.user.id;

    // Get subscribers for segment
    const subscribers = await this.prisma.subscriber.findMany({
      where: {
        userId,
        status: 'active',
      },
      take: 100, // Limit for demo
    });

    // Send bulk emails
    const emails = subscribers.map(s => ({
      to: s.email,
      subject: dto.subject,
      html: dto.html,
    }));

    const results = await Promise.all(
      emails.map(e => this.email.sendEmail(e)),
    );

    // Invalidate cache
    await this.cache.invalidatePattern(`onmail:dashboard:${userId}`);

    return {
      sent: results.filter(r => r).length,
      failed: results.filter(r => !r).length,
      campaignId: `camp_${Date.now()}`,
    };
  }

  @Get('analytics/:campaignId')
  async getCampaignAnalytics(
    @Req() req,
    campaignId: string,
  ) {
    const cacheKey = `onmail:analytics:${campaignId}`;

    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;

    const analytics = {
      campaignId,
      opens: 700,
      openRate: '28%',
      clicks: 105,
      clickRate: '4.2%',
      conversions: 12,
      conversionRate: '1.2%',
      revenue: 1260,
      roiPercentage: '6200%',
      topLinks: [
        { url: 'landing.com', clicks: 45 },
        { url: 'product.com', clicks: 35 },
      ],
    };

    await this.cache.set(cacheKey, analytics, 600);
    return analytics;
  }

  @Get('subscribers')
  async getSubscribers(@Req() req) {
    const subscribers = await this.prisma.subscriber.findMany({
      where: { userId: req.user.id },
      take: 50,
      orderBy: { createdAt: 'desc' },
    });

    return {
      total: subscribers.length,
      active: subscribers.filter(s => s.status === 'active').length,
      bounced: subscribers.filter(s => s.status === 'bounced').length,
      unsubscribed: subscribers.filter(s => s.status === 'unsubscribed').length,
      subscribers,
    };
  }
}
