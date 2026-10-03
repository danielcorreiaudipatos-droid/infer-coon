#!/bin/bash

# Implement Subscriptions endpoints
cat > src/modules/subscriptions/subscriptions.service.ts << 'EOF'
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SubscriptionsService {
  constructor(private prisma: PrismaService) {}

  async getPlans() {
    return this.prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
    });
  }

  async createSubscription(userId: string, planId: string) {
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });

    const subscription = await this.prisma.userSubscription.create({
      data: {
        userId,
        planId,
        status: 'active',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      subscription,
      message: `Subscribed to ${plan?.name}`,
    };
  }

  async getMySubscription(userId: string) {
    return this.prisma.userSubscription.findFirst({
      where: { userId, status: 'active' },
      include: { plan: true },
    });
  }

  async cancelSubscription(subscriptionId: string) {
    return this.prisma.userSubscription.update({
      where: { id: subscriptionId },
      data: {
        status: 'cancelled',
        cancelledAt: new Date(),
      },
    });
  }
}
EOF

# Implement Subscriptions Controller
cat > src/modules/subscriptions/subscriptions.controller.ts << 'EOF'
import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SubscriptionsService } from './subscriptions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Subscriptions')
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly service: SubscriptionsService) {}

  @Get('plans')
  async getPlans() {
    return this.service.getPlans();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async create(@Request() req: any, @Body() data: any) {
    return this.service.createSubscription(req.user.id, data.planId);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getMe(@Request() req: any) {
    return this.service.getMySubscription(req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async cancel(@Param('id') id: string) {
    return this.service.cancelSubscription(id);
  }
}
EOF

# Implement Payments Service
cat > src/modules/payments/payments.service.ts << 'EOF'
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async recordPayment(userId: string, data: any) {
    return this.prisma.payment.create({
      data: {
        userId,
        amount: data.amount,
        status: 'succeeded',
        paymentMethod: data.paymentMethod,
        last4Digits: data.last4Digits,
        stripePaymentId: data.stripePaymentId,
        succeededAt: new Date(),
      },
    });
  }

  async getPayments(userId: string) {
    return this.prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getInvoices(userId: string) {
    return this.prisma.invoice.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async handleWebhook(data: any) {
    if (data.type === 'payment_intent.succeeded') {
      return { message: 'Payment processed', status: 'success' };
    }
    return { message: 'Webhook received' };
  }
}
EOF

# Implement Payments Controller
cat > src/modules/payments/payments.controller.ts << 'EOF'
import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly service: PaymentsService) {}

  @Post('webhook')
  async webhook(@Body() data: any) {
    return this.service.handleWebhook(data);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getPayments(@Request() req: any) {
    return this.service.getPayments(req.user.id);
  }

  @Get('invoices')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getInvoices(@Request() req: any) {
    return this.service.getInvoices(req.user.id);
  }

  @Post('record')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async recordPayment(@Request() req: any, @Body() data: any) {
    return this.service.recordPayment(req.user.id, data);
  }
}
EOF

# Implement Content Service
cat > src/modules/content/content.service.ts << 'EOF'
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
EOF

# Implement Content Controller
cat > src/modules/content/content.controller.ts << 'EOF'
import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ContentService } from './content.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Content')
@Controller('content')
export class ContentController {
  constructor(private readonly service: ContentService) {}

  @Get()
  async getAll() {
    return this.service.getAll();
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.service.getById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async create(@Request() req: any, @Body() data: any) {
    return this.service.create(req.user.id, data);
  }

  @Post(':id/access')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async trackAccess(@Request() req: any, @Param('id') contentId: string) {
    return this.service.trackAccess(req.user.id, contentId);
  }

  @Get(':id/access')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async checkAccess(@Request() req: any, @Param('id') contentId: string) {
    return this.service.hasAccess(req.user.id, contentId);
  }
}
EOF

# Implement Marketplace Service
cat > src/modules/marketplace/marketplace.service.ts << 'EOF'
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

    const creatorEarnings = product!.price * 0.7;
    const platformFee = product!.price * 0.3;

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
EOF

# Implement Marketplace Controller
cat > src/modules/marketplace/marketplace.controller.ts << 'EOF'
import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { MarketplaceService } from './marketplace.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Marketplace')
@Controller('marketplace')
export class MarketplaceController {
  constructor(private readonly service: MarketplaceService) {}

  @Get()
  async getProducts() {
    return this.service.getProducts();
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.service.getById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async create(@Request() req: any, @Body() data: any) {
    return this.service.createProduct(req.user.id, data);
  }

  @Post(':id/purchase')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async purchase(@Request() req: any, @Param('id') productId: string) {
    return this.service.purchaseProduct(req.user.id, productId);
  }

  @Get('purchases/me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getPurchases(@Request() req: any) {
    return this.service.getPurchases(req.user.id);
  }
}
EOF

# Implement Analytics Service
cat > src/modules/analytics/analytics.service.ts << 'EOF'
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getMyAnalytics(userId: string) {
    return this.prisma.userAnalytics.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 30,
    });
  }

  async getCreatorAnalytics(creatorId: string) {
    return this.prisma.creatorAnalytics.findMany({
      where: { creatorId },
      orderBy: { date: 'desc' },
      take: 30,
    });
  }

  async getDashboard() {
    const totalUsers = await this.prisma.user.count();
    const totalCreators = await this.prisma.creator.count();
    const activeSubscriptions = await this.prisma.userSubscription.count({
      where: { status: 'active' },
    });

    return {
      totalUsers,
      totalCreators,
      activeSubscriptions,
      timestamp: new Date(),
    };
  }
}
EOF

# Implement Analytics Controller
cat > src/modules/analytics/analytics.controller.ts << 'EOF'
import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly service: AnalyticsService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getMyAnalytics(@Request() req: any) {
    return this.service.getMyAnalytics(req.user.id);
  }

  @Get('creator/:id')
  async getCreatorAnalytics(@Param('id') creatorId: string) {
    return this.service.getCreatorAnalytics(creatorId);
  }

  @Get('dashboard')
  async getDashboard() {
    return this.service.getDashboard();
  }
}
EOF

echo "✅ All endpoints implemented!"
