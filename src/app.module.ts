import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaService } from './services/prisma.service';
import { OnzapAiChatService } from './services/onzap-ai-chat.service';
import { PerformanceOptimizationService } from './services/performance-optimization.service';
import { GamificationService } from './services/gamification.service';
import { BillingService } from './services/billing.service';
import { OnzapChatController } from './controllers/onzap-chat.controller';
import { CampaignDashboardController } from './controllers/campaign-dashboard.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dev-secret-key-change-in-production',
      signOptions: { expiresIn: process.env.JWT_EXPIRATION || '24h' },
    }),
  ],
  providers: [
    PrismaService,
    OnzapAiChatService,
    PerformanceOptimizationService,
    GamificationService,
    BillingService,
  ],
  controllers: [OnzapChatController, CampaignDashboardController],
})
export class AppModule {}
