import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { CreatorsModule } from './modules/creators/creators.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ContentModule } from './modules/content/content.module';
import { MarketplaceModule } from './modules/marketplace/marketplace.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    HealthModule,
    AuthModule,
    CreatorsModule,
    SubscriptionsModule,
    PaymentsModule,
    ContentModule,
    MarketplaceModule,
    AnalyticsModule,
  ],
})
export class AppModule {}
