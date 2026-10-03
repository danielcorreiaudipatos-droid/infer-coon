/**
 * Billing Service - Subscription & Revenue Share
 * Handles: Recurring charges, add-ons, campaign spend, revenue share
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import axios from 'axios';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number; // R$
  features: string[];
  limits: Record<string, number>;
}

interface BillingCycle {
  userId: string;
  amount: number;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  dueDate: Date;
  paidDate?: Date;
}

interface CampaignSpend {
  userId: string;
  campaignId: string;
  platform: string; // 'google', 'meta', 'tiktok'
  spentAmount: number; // Total amount user wants to spend
  ourMargin: number; // Our cut (20%)
  platformAmount: number; // Amount sent to platform (80%)
  status: 'pending' | 'active' | 'completed' | 'failed';
  createdAt: Date;
}

@Injectable()
export class BillingService {
  // Plans definition
  private onzapPlans: SubscriptionPlan[] = [
    {
      id: 'onzap-starter',
      name: 'ONZAP Starter',
      price: 59,
      features: [
        '2 WhatsApp accounts',
        '1k contacts',
        'Basic AI responses',
        'Email support',
      ],
      limits: {
        whatsappAccounts: 2,
        contactsLimit: 1000,
        broadcastsPerMonth: 10,
      },
    },
    {
      id: 'onzap-pro',
      name: 'ONZAP Professional',
      price: 199,
      features: [
        '5 WhatsApp accounts',
        '10k contacts',
        'Advanced AI (70%+ accuracy)',
        'Lead scoring',
        'API access',
      ],
      limits: {
        whatsappAccounts: 5,
        contactsLimit: 10000,
        broadcastsPerMonth: -1, // unlimited
      },
    },
  ];

  private onlovePlans: SubscriptionPlan[] = [
    {
      id: 'onlove-basic',
      name: 'ONLOVE Basic',
      price: 49,
      features: [
        'Unlimited community members',
        '1k email subscribers',
        'Basic monetization',
        'Affiliate 5%',
      ],
      limits: {
        emailSubscribers: 1000,
        monetizationTiers: 1,
        communities: 1,
      },
    },
    {
      id: 'onlove-pro',
      name: 'ONLOVE Pro',
      price: 149,
      features: [
        'Unlimited members',
        '10k email subscribers',
        '5 monetization tiers',
        'Digital product shop',
        'API access',
      ],
      limits: {
        emailSubscribers: 10000,
        monetizationTiers: 5,
        communities: 1,
      },
    },
  ];

  // Revenue share configuration
  private marginConfig = {
    campaignAds: 0.2, // 20% margin on ad spend
    platformFee: 0.8, // 80% goes to platform
  };

  constructor(private prisma: PrismaService) {}

  /**
   * Create subscription for user
   */
  async createSubscription(
    userId: string,
    planId: string,
    paymentMethod: 'card' | 'pix',
  ): Promise<{
    success: boolean;
    subscriptionId: string;
    nextBillingDate: Date;
    amount: number;
  }> {
    // Get plan
    const plan = this.getPlanById(planId);
    if (!plan) {
      throw new Error('Plan not found');
    }

    try {
      // Process payment via Stripe/Assas
      const paymentResult = await this.processPayment(
        userId,
        plan.price,
        paymentMethod,
      );

      if (!paymentResult.success) {
        throw new Error('Payment failed');
      }

      // Create subscription in database
      const subscription = await this.prisma.subscription.create({
        data: {
          userId,
          planId: plan.id,
          price: plan.price,
          status: 'active',
          currentPeriodStart: new Date(),
          currentPeriodEnd: this.getNextBillingDate(),
          paymentMethodId: paymentResult.methodId,
        },
      });

      // Update user features based on plan
      await this.updateUserFeatures(userId, plan.limits);

      return {
        success: true,
        subscriptionId: subscription.id,
        nextBillingDate: subscription.currentPeriodEnd,
        amount: plan.price,
      };
    } catch (error) {
      console.error('Subscription creation failed:', error);
      throw error;
    }
  }

  /**
   * Process recurring billing
   * Run daily to charge customers
   */
  async processRecurringBilling(): Promise<{
    successful: number;
    failed: number;
    failedCustomers: string[];
  }> {
    const today = new Date();
    let successful = 0;
    let failed = 0;
    const failedCustomers: string[] = [];

    // Find subscriptions due for billing today
    const dueBillings = await this.prisma.subscription.findMany({
      where: {
        status: 'active',
        currentPeriodEnd: {
          lte: today,
        },
      },
    });

    for (const billing of dueBillings) {
      try {
        // Try to charge
        const charged = await this.chargeSubscription(billing.userId);

        if (charged) {
          successful++;
          // Update next billing date
          await this.prisma.subscription.update({
            where: { id: billing.id },
            data: {
              currentPeriodStart: new Date(),
              currentPeriodEnd: this.getNextBillingDate(),
            },
          });
        } else {
          failed++;
          // Retry logic (max 3 attempts)
          await this.handleFailedPayment(billing.userId);
        }
      } catch (error) {
        failed++;
        failedCustomers.push(billing.userId);
        await this.handleFailedPayment(billing.userId);
      }
    }

    return { successful, failed, failedCustomers };
  }

  /**
   * Charge user for subscription
   */
  private async chargeSubscription(userId: string): Promise<boolean> {
    const subscription = await this.prisma.subscription.findFirst({
      where: { userId, status: 'active' },
    });

    if (!subscription) {
      return false;
    }

    try {
      const result = await this.processPayment(
        userId,
        subscription.price,
        'card',
      );
      return result.success;
    } catch (error) {
      return false;
    }
  }

  /**
   * Handle failed payment - retry logic
   */
  private async handleFailedPayment(userId: string): Promise<void> {
    const failedPayment = await this.prisma.failedPayment.findFirst({
      where: { userId },
    });

    if (!failedPayment) {
      // First failure
      await this.prisma.failedPayment.create({
        data: {
          userId,
          attempts: 1,
          lastAttempt: new Date(),
          nextRetry: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
        },
      });

      // Send email notification
      await this.sendPaymentFailureEmail(userId, 1);
    } else if (failedPayment.attempts < 3) {
      // Retry
      await this.prisma.failedPayment.update({
        where: { id: failedPayment.id },
        data: {
          attempts: failedPayment.attempts + 1,
          lastAttempt: new Date(),
          nextRetry: new Date(
            Date.now() + (failedPayment.attempts + 1) * 2 * 24 * 60 * 60 * 1000,
          ),
        },
      });

      await this.sendPaymentFailureEmail(userId, failedPayment.attempts + 1);
    } else {
      // After 3 failures - downgrade to free
      await this.downgradeToFree(userId);
      await this.sendPaymentFailureEmail(userId, 3);
    }
  }

  /**
   * CAMPAIGN SPEND - Revenue Share Calculation
   * User spends R$20 → We get R$4 (20%), Google gets R$16 (80%)
   */
  async createCampaignSpend(
    userId: string,
    campaignId: string,
    platform: 'google' | 'meta' | 'tiktok',
    spentAmount: number,
  ): Promise<CampaignSpend> {
    // Calculate our margin
    const ourMargin = spentAmount * this.marginConfig.campaignAds;
    const platformAmount = spentAmount * this.marginConfig.platformFee;

    const spend: CampaignSpend = {
      userId,
      campaignId,
      platform,
      spentAmount,
      ourMargin, // R$4 from R$20
      platformAmount, // R$16 from R$20
      status: 'pending',
      createdAt: new Date(),
    };

    // Store in database
    await this.prisma.campaignSpend.create({
      data: {
        userId,
        campaignId,
        platform,
        spentAmount,
        ourMargin,
        platformAmount,
        status: 'pending',
      },
    });

    // Charge user immediately (for ad spend)
    try {
      const charged = await this.processPayment(userId, spentAmount, 'card');

      if (charged.success) {
        // Send to platform
        await this.sendToPlatform(platform, campaignId, platformAmount);

        // Update status
        await this.prisma.campaignSpend.update({
          where: { id: spend.campaignId },
          data: { status: 'active' },
        });

        // Record our revenue
        await this.recordRevenue(userId, ourMargin, 'campaign_spend');
      }
    } catch (error) {
      console.error('Campaign spend charge failed:', error);
      throw error;
    }

    return spend;
  }

  /**
   * Send money to advertising platform
   * Simulate sending R$16 to Google Ads account
   */
  private async sendToPlatform(
    platform: string,
    campaignId: string,
    amount: number,
  ): Promise<void> {
    // In production, integrate with:
    // - Google Ads API
    // - Meta Ads API
    // - TikTok Ads API

    console.log(
      `Sending R$${amount} to ${platform} for campaign ${campaignId}`,
    );

    // Store transaction
    await this.prisma.platformPayment.create({
      data: {
        platform,
        campaignId,
        amount,
        status: 'sent',
        sentAt: new Date(),
      },
    });
  }

  /**
   * Record our revenue (20% margin)
   */
  private async recordRevenue(
    userId: string,
    amount: number,
    type: string,
  ): Promise<void> {
    await this.prisma.revenue.create({
      data: {
        userId,
        amount,
        type, // 'subscription', 'campaign_spend', 'add_on'
        recordedAt: new Date(),
      },
    });
  }

  /**
   * Get user's usage and calculate charges
   */
  async getUsageCharges(userId: string): Promise<{
    baseSubscription: number;
    addOns: { name: string; cost: number }[];
    total: number;
  }> {
    // Get subscription
    const subscription = await this.prisma.subscription.findFirst({
      where: { userId, status: 'active' },
    });

    let baseSubscription = 0;
    if (subscription) {
      baseSubscription = subscription.price;
    }

    // Get add-ons usage
    const usage = await this.prisma.usageMetrics.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const addOns: { name: string; cost: number }[] = [];

    if (usage) {
      // Extra contacts (R$9 per 1k, beyond plan limit)
      if (usage.contactsUsed > 1000) {
        const extraContacts = Math.ceil((usage.contactsUsed - 1000) / 1000);
        const cost = extraContacts * 9;
        addOns.push({
          name: `Extra ${extraContacts}k contacts`,
          cost,
        });
      }

      // Extra API calls (R$99/month unlimited, but charged if over limit)
      if (usage.apiCallsUsed > 10000) {
        addOns.push({
          name: 'Extra API calls',
          cost: 99,
        });
      }
    }

    const total = baseSubscription + addOns.reduce((sum, a) => sum + a.cost, 0);

    return {
      baseSubscription,
      addOns,
      total,
    };
  }

  /**
   * Helper: Get next billing date (30 days from now)
   */
  private getNextBillingDate(): Date {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date;
  }

  /**
   * Helper: Get plan by ID
   */
  private getPlanById(planId: string): SubscriptionPlan | undefined {
    return [
      ...this.onzapPlans,
      ...this.onlovePlans,
    ].find((p) => p.id === planId);
  }

  /**
   * Helper: Process payment (Stripe/Assas integration)
   */
  private async processPayment(
    userId: string,
    amount: number,
    method: string,
  ): Promise<{ success: boolean; methodId: string }> {
    try {
      // Integration with Stripe or Assas
      // For now, simulate success
      const methodId = `pm_${Date.now()}`;

      // In production, call Stripe API:
      // const charge = await stripe.charges.create({
      //   amount: amount * 100, // in cents
      //   currency: 'brl',
      //   customer: userId,
      // });

      return {
        success: true,
        methodId,
      };
    } catch (error) {
      console.error('Payment processing failed:', error);
      return {
        success: false,
        methodId: '',
      };
    }
  }

  /**
   * Helper: Update user features
   */
  private async updateUserFeatures(
    userId: string,
    limits: Record<string, number>,
  ): Promise<void> {
    // Update user's feature access based on plan
    console.log(`Updated features for user ${userId}:`, limits);
  }

  /**
   * Helper: Send payment failure email
   */
  private async sendPaymentFailureEmail(
    userId: string,
    attemptNumber: number,
  ): Promise<void> {
    if (attemptNumber === 3) {
      console.log(`Downgrading user ${userId} to free plan`);
    } else {
      console.log(
        `Sending payment failure email to ${userId} (attempt ${attemptNumber})`,
      );
    }
  }

  /**
   * Helper: Downgrade to free plan
   */
  private async downgradeToFree(userId: string): Promise<void> {
    await this.prisma.subscription.updateMany({
      where: { userId },
      data: { status: 'canceled' },
    });

    // Reset user features to free tier
    console.log(`User ${userId} downgraded to free plan`);
  }

  /**
   * Get revenue metrics
   */
  async getRevenueMetrics(): Promise<{
    totalMRR: number;
    subscriptionMRR: number;
    campaignSpendMRR: number;
    addOnsMRR: number;
    totalCustomers: number;
    churnRate: number;
  }> {
    const subscriptions = await this.prisma.subscription.findMany({
      where: { status: 'active' },
    });

    const subscriptionMRR = subscriptions.reduce(
      (sum, sub) => sum + sub.price,
      0,
    );

    // Calculate other metrics
    const revenue = await this.prisma.revenue.findMany({
      where: {
        recordedAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
    });

    const campaignSpendMRR = revenue
      .filter((r) => r.type === 'campaign_spend')
      .reduce((sum, r) => sum + r.amount, 0);

    const addOnsMRR = revenue
      .filter((r) => r.type === 'add_on')
      .reduce((sum, r) => sum + r.amount, 0);

    const totalMRR = subscriptionMRR + campaignSpendMRR + addOnsMRR;

    return {
      totalMRR,
      subscriptionMRR,
      campaignSpendMRR,
      addOnsMRR,
      totalCustomers: subscriptions.length,
      churnRate: 0.02, // 2% target
    };
  }
}
