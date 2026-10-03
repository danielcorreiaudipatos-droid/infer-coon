/**
 * Campaign Dashboard Controller
 * Unified view for Google Ads, Meta Ads, TikTok Ads
 * Easy to manage, easy to invest
 */

import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

interface CampaignInput {
  name: string;
  platform: 'google' | 'meta' | 'tiktok';
  budget: number; // R$
  dailyBudget?: number; // R$ per day
  objective: string; // 'conversions', 'clicks', 'impressions', 'reach'
  targetAudience: string;
  adCreative: {
    headline: string;
    description: string;
    imageUrl?: string;
    videoUrl?: string;
  };
}

interface CampaignDashboard {
  campaign: {
    id: string;
    name: string;
    platform: string;
    status: 'draft' | 'active' | 'paused' | 'completed';
    totalBudget: number;
    spent: number;
    remaining: number;
    createdAt: Date;
  };
  performance: {
    impressions: number;
    clicks: number;
    ctr: number; // Click-through rate
    conversions: number;
    conversionRate: number;
    cost: number; // How much spent
    cpc: number; // Cost per click
    cpm: number; // Cost per 1k impressions
  };
  roi: {
    revenue: number;
    profit: number;
    roiPercentage: number;
  };
}

@Controller('api/campaigns')
@UseGuards(AuthGuard('jwt'))
export class CampaignDashboardController {
  /**
   * GET /api/campaigns/dashboard
   * Get unified dashboard for all campaigns
   */
  @Get('dashboard')
  async getCampaignDashboard(@Body() dto: { userId: string }) {
    return {
      summary: {
        totalCampaigns: 5,
        activeCampaigns: 3,
        totalSpent: 1250,
        totalRevenue: 5000,
        averageROI: '300%',
      },
      campaigns: [
        {
          id: 'campaign_1',
          name: 'Black Friday Google Ads',
          platform: 'google',
          icon: '🔵',
          status: 'active',
          budget: 500,
          spent: 320,
          remaining: 180,
          roi: '450%',
        },
        {
          id: 'campaign_2',
          name: 'Product Launch Meta',
          platform: 'meta',
          icon: '📘',
          status: 'active',
          budget: 400,
          spent: 280,
          remaining: 120,
          roi: '380%',
        },
        {
          id: 'campaign_3',
          name: 'TikTok Challenge',
          platform: 'tiktok',
          icon: '🎵',
          status: 'active',
          budget: 350,
          spent: 180,
          remaining: 170,
          roi: '520%',
        },
      ],
      recommendedActions: [
        '✅ Campaign 3 (TikTok) has best ROI - consider increasing budget',
        '⚠️ Campaign 1 (Google) approaching budget limit',
        '📊 Meta campaign could use optimization - CTR below target',
      ],
    };
  }

  /**
   * POST /api/campaigns/create
   * Create a new unified campaign across platforms
   */
  @Post('create')
  async createCampaign(
    @Body()
    dto: {
      userId: string;
      campaigns: CampaignInput[];
      totalBudget: number;
      startDate: Date;
      endDate: Date;
    },
  ) {
    // Example: Create campaigns on Google, Meta, TikTok simultaneously
    const googleCampaign = dto.campaigns.find((c) => c.platform === 'google');
    const metaCampaign = dto.campaigns.find((c) => c.platform === 'meta');
    const tiktokCampaign = dto.campaigns.find((c) => c.platform === 'tiktok');

    return {
      success: true,
      campaignId: `camp_${Date.now()}`,
      platforms: [
        googleCampaign && {
          platform: 'Google Ads',
          status: 'active',
          accountId: 'google_12345',
          campaignId: 'goog_camp_001',
          budget: googleCampaign.budget,
        },
        metaCampaign && {
          platform: 'Meta Ads',
          status: 'active',
          accountId: 'meta_67890',
          campaignId: 'meta_camp_001',
          budget: metaCampaign.budget,
        },
        tiktokCampaign && {
          platform: 'TikTok Ads',
          status: 'active',
          accountId: 'tiktok_11111',
          campaignId: 'tiktok_camp_001',
          budget: tiktokCampaign.budget,
        },
      ].filter(Boolean),
      totalBudget: dto.totalBudget,
      estimatedMonthlyRevenue: dto.totalBudget * 3, // Assume 3:1 ROAS
      estimatedOurMargin: dto.totalBudget * 0.2, // 20%
      message: `Campaign created successfully! You'll spend R$${dto.totalBudget}, we take R$${dto.totalBudget * 0.2} (20% margin), platforms get R$${dto.totalBudget * 0.8} (80%)`,
    };
  }

  /**
   * GET /api/campaigns/:id
   * Get detailed campaign performance
   */
  @Get(':id')
  async getCampaignDetails(@Param('id') campaignId: string) {
    return {
      campaign: {
        id: campaignId,
        name: 'Q4 Holiday Campaign',
        platform: 'google', // or meta, tiktok
        status: 'active',
        totalBudget: 500,
        spent: 320,
        remaining: 180,
        startDate: '2026-10-01',
        endDate: '2026-12-31',
        dailyBudget: 10,
      },
      performance: {
        impressions: 125000,
        clicks: 3750,
        ctr: '3.0%', // Click-through rate
        conversions: 450,
        conversionRate: '12%',
        cost: 320, // R$320 spent
        cpc: 0.85, // R$0.85 per click
        cpm: 2.56, // R$2.56 per 1000 impressions
      },
      roi: {
        revenue: 1500, // R$1500 revenue generated
        profit: 1180, // R$1500 - R$320
        roiPercentage: '368%',
      },
      dailyPerformance: [
        { date: '2026-10-01', spent: 10, clicks: 125, conversions: 15, roi: '450%' },
        { date: '2026-10-02', spent: 10, clicks: 132, conversions: 18, roi: '500%' },
        { date: '2026-10-03', spent: 10, clicks: 142, conversions: 22, roi: '580%' },
      ],
      recommendations: [
        '📈 Increase daily budget - strong performance (500% ROI)',
        '🎯 Target audience 25-34 has best conversion rate',
        '🖼️ Image Ad 3 outperforms others - use as main creative',
      ],
    };
  }

  /**
   * PUT /api/campaigns/:id
   * Update campaign (adjust budget, pause, etc)
   */
  @Put(':id')
  async updateCampaign(
    @Param('id') campaignId: string,
    @Body() dto: { action: 'pause' | 'resume' | 'increase_budget' | 'decrease_budget'; amount?: number },
  ) {
    return {
      success: true,
      campaignId,
      action: dto.action,
      message:
        dto.action === 'pause'
          ? 'Campaign paused. Budget not charged.'
          : `Budget adjusted to R$${dto.amount}`,
      newStatus: dto.action === 'pause' ? 'paused' : 'active',
    };
  }

  /**
   * POST /api/campaigns/:id/add-budget
   * Add more budget to active campaign
   */
  @Post(':id/add-budget')
  async addBudget(
    @Param('id') campaignId: string,
    @Body() dto: { additionalBudget: number },
  ) {
    return {
      success: true,
      campaignId,
      additionalBudget: dto.additionalBudget,
      newTotalBudget: 500 + dto.additionalBudget,
      ourMargin: dto.additionalBudget * 0.2,
      platformAmount: dto.additionalBudget * 0.8,
      message: `Added R$${dto.additionalBudget}. You pay R$${dto.additionalBudget}, we get R$${dto.additionalBudget * 0.2}, platforms get R$${dto.additionalBudget * 0.8}.`,
    };
  }

  /**
   * GET /api/campaigns/compare
   * Compare performance across platforms
   */
  @Get('compare/all')
  async compareAllPlatforms(@Body() dto: { userId: string }) {
    return {
      comparison: [
        {
          platform: 'Google Ads 🔵',
          campaigns: 2,
          totalSpent: 620,
          totalRevenue: 2800,
          roi: '351%',
          avgCPC: 0.85,
          avgCTR: '3.2%',
          recommendation: 'Best performing platform - increase investment',
        },
        {
          platform: 'Meta Ads 📘',
          campaigns: 2,
          totalSpent: 500,
          totalRevenue: 1900,
          roi: '280%',
          avgCPC: 1.2,
          avgCTR: '2.1%',
          recommendation: 'Good performance - optimize creative',
        },
        {
          platform: 'TikTok Ads 🎵',
          campaigns: 1,
          totalSpent: 130,
          totalRevenue: 1300,
          roi: '900%',
          avgCPC: 0.65,
          avgCTR: '5.2%',
          recommendation: 'Excellent ROI - recommended to scale up',
        },
      ],
      summary: {
        bestPlatform: 'TikTok (900% ROI)',
        recommendations: [
          '💡 TikTok showing highest ROI - consider reallocating 20% from Google',
          '💡 Meta needs creative optimization - test new ad formats',
          '💡 All platforms profitable - safe to increase overall budget',
        ],
      },
    };
  }

  /**
   * GET /api/campaigns/analytics
   * Full analytics with AI insights
   */
  @Get('analytics/full')
  async getFullAnalytics(@Body() dto: { userId: string }) {
    return {
      period: 'Last 30 Days',
      overview: {
        totalInvestment: 1250,
        totalRevenue: 5000,
        totalProfit: 3750,
        roi: '300%',
        averageDailyBudget: 41.67,
      },
      byPlatform: [
        {
          platform: 'Google',
          budget: 620,
          revenue: 2800,
          roi: '351%',
        },
        {
          platform: 'Meta',
          budget: 500,
          revenue: 1900,
          roi: '280%',
        },
        {
          platform: 'TikTok',
          budget: 130,
          revenue: 1300,
          roi: '900%',
        },
      ],
      customerSegment: {
        highValue: { count: 450, avgLTV: 10, totalRevenue: 4500 },
        mediumValue: { count: 80, avgLTV: 6.25, totalRevenue: 500 },
      },
      trends: {
        yesterday: 'ROI up 12% vs last week',
        thisWeek: 'TikTok trending up 45%',
        thisMonth: '+35% revenue vs September',
      },
      aiInsights: [
        '🚀 TikTok is your best performer - scale to R$500/month',
        '🎯 Your audience is 60% female, 25-34 age - target that',
        '⚠️ Meta CPC rising - consider pausing low-performers',
        '💰 If you invest R$500 more, expect +R$1,500 revenue (based on trends)',
      ],
    };
  }

  /**
   * POST /api/campaigns/pay-now
   * Quick payment for ad spend
   */
  @Post('pay-now')
  async payNow(
    @Body()
    dto: {
      userId: string;
      amount: number; // R$20 for example
      platform: string;
      paymentMethod: 'card' | 'pix';
    },
  ) {
    const ourMargin = dto.amount * 0.2; // R$4
    const platformAmount = dto.amount * 0.8; // R$16

    return {
      success: true,
      paymentId: `pay_${Date.now()}`,
      amount: dto.amount,
      breakdown: {
        userPays: `R$${dto.amount} (total)`,
        ourMargin: `R$${ourMargin} (20% - we keep this)`,
        platformAmount: `R$${platformAmount} (80% - sent to ${dto.platform})`,
      },
      platformDetails: {
        platform: dto.platform,
        campaignId: 'auto-created',
        accountConnected: true,
        fundsReceived: platformAmount,
        status: 'processing',
      },
      message: `R$${dto.amount} charged successfully! We're sending R$${platformAmount} to ${dto.platform}. Keep R$${ourMargin}.`,
      nextSteps: [
        '✅ Payment processed',
        '📤 Funds sent to platform account',
        '⏱️ Campaign should go live in 10-30 minutes',
      ],
    };
  }
}
