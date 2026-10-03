import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { EmailService } from '../services/email.service';
import { CacheService } from '../services/cache.service';
import { TwilioService } from '../services/twilio.service';

@Controller('api/onzap')
@UseGuards(JwtAuthGuard)
export class OnzapDashboardController {
  constructor(
    private email: EmailService,
    private cache: CacheService,
    private twilio: TwilioService,
  ) {}

  @Get('dashboard')
  async getDashboard(@Req() req) {
    const userId = req.user.id;
    const cacheKey = `onzap:dashboard:${userId}`;

    // Try cache first
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;

    const dashboard = {
      userId,
      metrics: {
        unreadMessages: 124,
        streak: 12,
        rating: 4.8,
        responseRate: 89.2,
      },
      activities: [
        { type: 'message', count: 1250, time: '2 hours ago' },
        { type: 'conversion', count: 45, time: '4 hours ago' },
      ],
      recentContacts: [
        { name: 'João Silva', phone: '+5511999999', lastMessage: '5 min ago' },
        { name: 'Maria Santos', phone: '+5511888888', lastMessage: '1 hour ago' },
      ],
    };

    // Cache for 5 minutes
    await this.cache.set(cacheKey, dashboard, 300);

    return dashboard;
  }

  @Post('send-whatsapp')
  async sendWhatsapp(@Body() dto: { to: string; body: string }, @Req() req) {
    // Rate limit: 10 messages per minute
    const allowed = await this.cache.checkRateLimit(req.user.id, 'whatsapp', 10, 60);
    if (!allowed) {
      return { error: 'Rate limit exceeded' };
    }

    const sid = await this.twilio.sendWhatsappMessage(dto.to, dto.body);

    // Send notification email
    await this.email.sendEmail({
      to: req.user.email,
      subject: 'WhatsApp Message Sent',
      html: `<p>Message sent to ${dto.to}</p><p>${dto.body}</p>`,
      tags: ['onzap', 'whatsapp'],
    });

    return { success: true, sid };
  }

  @Post('import-contacts')
  async importContacts(
    @Body() dto: { source: string; contacts: any[] },
    @Req() req,
  ) {
    const userId = req.user.id;

    // Invalidate cache
    await this.cache.invalidatePattern(`onzap:dashboard:${userId}`);

    return {
      imported: dto.contacts.length,
      success: true,
    };
  }
}
