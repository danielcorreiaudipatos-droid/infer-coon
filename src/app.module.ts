import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaService } from './services/prisma.service';
import { OnzapAiChatService } from './services/onzap-ai-chat.service';
import { PerformanceOptimizationService } from './services/performance-optimization.service';
import { GamificationService } from './services/gamification.service';
import { BillingService } from './services/billing.service';
import { GoogleAuthService } from './auth/google-auth.service';
import { EmailService } from './services/email.service';
import { CacheService } from './services/cache.service';
import { AssasService } from './services/assas.service';
import { TwilioService } from './services/twilio.service';
import { OnzapChatController } from './controllers/onzap-chat.controller';
import { CampaignDashboardController } from './controllers/campaign-dashboard.controller';
import { AuthController } from './controllers/auth.controller';
import { OnzapDashboardController } from './controllers/onzap-dashboard.controller';
import { OnloveDashboardController } from './controllers/onlove-dashboard.controller';
import { OnmailDashboardController } from './controllers/onmail-dashboard.controller';
import { WalletDashboardController } from './controllers/wallet-dashboard.controller';
import { TVModule } from './modules/tv/tv.module';

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
    TVModule,
  ],
  providers: [
    PrismaService,
    OnzapAiChatService,
    PerformanceOptimizationService,
    GamificationService,
    BillingService,
    GoogleAuthService,
    EmailService,
    CacheService,
    AssasService,
    TwilioService,
  ],
  controllers: [
    OnzapChatController,
    CampaignDashboardController,
    AuthController,
    OnzapDashboardController,
    OnloveDashboardController,
    OnmailDashboardController,
    WalletDashboardController,
  ],
})
export class AppModule {}
