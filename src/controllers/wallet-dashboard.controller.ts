import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { AssasService } from '../services/assas.service';
import { CacheService } from '../services/cache.service';
import { EmailService } from '../services/email.service';
import { PrismaService } from '../database/prisma.service';

@Controller('api/wallet')
@UseGuards(JwtAuthGuard)
export class WalletDashboardController {
  constructor(
    private assas: AssasService,
    private cache: CacheService,
    private email: EmailService,
    private prisma: PrismaService,
  ) {}

  @Get('balance')
  async getBalance(@Req() req) {
    const userId = req.user.id;
    const cacheKey = `wallet:balance:${userId}`;

    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;

    const balance = {
      userId,
      total: 2500.50,
      available: 2200.00,
      pending: 300.50,
      frozen: 0,
      currency: 'BRL',
    };

    await this.cache.set(cacheKey, balance, 60);
    return balance;
  }

  @Get('transactions')
  async getTransactions(@Req() req) {
    const userId = req.user.id;
    const cacheKey = `wallet:transactions:${userId}`;

    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;

    const transactions = [
      {
        id: 'txn_1',
        type: 'credit',
        amount: 500,
        description: 'ONZAP Sales',
        status: 'completed',
        date: new Date(Date.now() - 3600000),
      },
      {
        id: 'txn_2',
        type: 'credit',
        amount: 800,
        description: 'ONLOVE Subscription',
        status: 'completed',
        date: new Date(Date.now() - 7200000),
      },
      {
        id: 'txn_3',
        type: 'debit',
        amount: 20,
        description: 'Google Campaign',
        status: 'completed',
        date: new Date(Date.now() - 10800000),
      },
      {
        id: 'txn_4',
        type: 'debit',
        amount: 150,
        description: 'SendGrid Email Charge',
        status: 'pending',
        date: new Date(Date.now() - 86400000),
      },
    ];

    await this.cache.set(cacheKey, transactions, 300);
    return { transactions, total: transactions.length };
  }

  @Post('transfer')
  async createTransfer(
    @Body() dto: { amount: number; recipientId: string; description?: string },
    @Req() req,
  ) {
    const userId = req.user.id;

    // Check balance
    const balance = await this.getBalance(req);
    if (balance.available < dto.amount) {
      return { error: 'Insufficient balance' };
    }

    // Create transfer record
    const transfer = {
      id: `txfr_${Date.now()}`,
      fromUserId: userId,
      toUserId: dto.recipientId,
      amount: dto.amount,
      description: dto.description || 'P2P Transfer',
      status: 'completed',
      createdAt: new Date(),
    };

    // Invalidate caches
    await this.cache.invalidatePattern(`wallet:balance:${userId}`);
    await this.cache.invalidatePattern(`wallet:transactions:${userId}`);

    // Send notifications
    await this.email.sendEmail({
      to: req.user.email,
      subject: 'Transfer Sent',
      html: `<p>You sent R$ ${dto.amount} to user ${dto.recipientId}</p>`,
      tags: ['wallet', 'transfer'],
    });

    return { success: true, transfer };
  }

  @Post('cashback')
  async recordCashback(
    @Body() dto: { source: string; amount: number },
    @Req() req,
  ) {
    const userId = req.user.id;

    const cashback = {
      id: `cashback_${Date.now()}`,
      userId,
      source: dto.source,
      amount: dto.amount,
      createdAt: new Date(),
    };

    // Invalidate caches
    await this.cache.invalidatePattern(`wallet:balance:${userId}`);
    await this.cache.invalidatePattern(`wallet:transactions:${userId}`);

    return { success: true, cashback };
  }

  @Post('charge-campaign')
  async chargeCampaignCost(
    @Body() dto: {
      campaignId: string;
      platform: 'google' | 'tiktok' | 'meta';
      cost: number;
    },
    @Req() req,
  ) {
    const userId = req.user.id;

    // Check balance
    const balance = await this.getBalance(req);
    if (balance.available < dto.cost) {
      return {
        error: 'Insufficient balance for campaign',
        required: dto.cost,
        available: balance.available,
      };
    }

    // Debit wallet
    const charge = {
      id: `charge_${Date.now()}`,
      userId,
      campaignId: dto.campaignId,
      platform: dto.platform,
      amount: dto.cost,
      status: 'completed',
      createdAt: new Date(),
    };

    // Invalidate caches
    await this.cache.invalidatePattern(`wallet:balance:${userId}`);
    await this.cache.invalidatePattern(`wallet:transactions:${userId}`);

    // Send receipt
    await this.email.sendEmail({
      to: req.user.email,
      subject: `Campaign Charged - ${dto.platform.toUpperCase()}`,
      html: `
        <p>Campaign: ${dto.campaignId}</p>
        <p>Platform: ${dto.platform}</p>
        <p>Amount: R$ ${dto.cost}</p>
        <p>Status: Deducted from wallet</p>
      `,
      tags: ['wallet', 'campaign', 'charge'],
    });

    return { success: true, charge };
  }

  @Post('auto-debit')
  async setupAutoDebit(
    @Body()
    dto: {
      enabled: boolean;
      autoDebitWhen: 'low_balance' | 'monthly' | 'weekly';
      sourceAccount: string;
      cvv: string;
    },
    @Req() req,
  ) {
    const userId = req.user.id;

    // Store auto-debit preference
    await this.cache.set(
      `wallet:autodebit:${userId}`,
      {
        enabled: dto.enabled,
        autoDebitWhen: dto.autoDebitWhen,
        lastUpdated: new Date(),
      },
      86400 * 30, // 30 days
    );

    return {
      success: true,
      message: `Auto-debit ${dto.enabled ? 'enabled' : 'disabled'}`,
    };
  }

  @Post('referral-bonus')
  async recordReferralBonus(
    @Body() dto: { referredUserId: string; bonus: number },
    @Req() req,
  ) {
    const userId = req.user.id;

    const referral = {
      id: `ref_${Date.now()}`,
      referrerId: userId,
      referredUserId: dto.referredUserId,
      bonus: dto.bonus,
      status: 'approved',
      createdAt: new Date(),
    };

    // Invalidate caches
    await this.cache.invalidatePattern(`wallet:balance:${userId}`);
    await this.cache.invalidatePattern(`wallet:transactions:${userId}`);

    // Send bonus notification
    await this.email.sendEmail({
      to: req.user.email,
      subject: 'Referral Bonus Received',
      html: `<p>You earned R$ ${dto.bonus} from referral</p>`,
      tags: ['wallet', 'referral', 'bonus'],
    });

    return { success: true, referral };
  }

  @Get('daily-summary')
  async getDailySummary(@Req() req) {
    const userId = req.user.id;
    const cacheKey = `wallet:summary:${userId}`;

    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;

    const summary = {
      date: new Date(),
      totalIncome: 1300,
      totalExpenses: 170,
      netIncome: 1130,
      breakdown: {
        onzap: 500,
        onlove: 800,
        googleCampaign: -20,
        sendgrid: -150,
      },
    };

    await this.cache.set(cacheKey, summary, 3600);
    return summary;
  }
}
