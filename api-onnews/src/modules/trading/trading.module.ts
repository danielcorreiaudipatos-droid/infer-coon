import { Module } from '@nestjs/common';
import { TradingService } from './trading.service';
import { TradingController } from './trading.controller';
import { PrismaService } from '../../common/services/prisma.service';

@Module({
  controllers: [TradingController],
  providers: [TradingService, PrismaService],
})
export class TradingModule {}
