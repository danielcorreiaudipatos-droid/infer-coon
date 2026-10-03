import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaService } from './common/services/prisma.service';
import { JwtStrategy } from './common/strategies/jwt.strategy';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { StreamsModule } from './modules/streams/streams.module';
import { QuotesModule } from './modules/quotes/quotes.module';
import { TradingModule } from './modules/trading/trading.module';
import { LeaderboardModule } from './modules/leaderboard/leaderboard.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { StreamersModule } from './modules/streamers/streamers.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dev-secret-key-change-in-production',
      signOptions: { expiresIn: process.env.JWT_EXPIRATION || '24h' },
    }),
    AuthModule,
    UsersModule,
    WalletModule,
    StreamsModule,
    QuotesModule,
    TradingModule,
    LeaderboardModule,
    NotificationsModule,
    StreamersModule,
  ],
  providers: [PrismaService, JwtStrategy],
})
export class AppModule {}
