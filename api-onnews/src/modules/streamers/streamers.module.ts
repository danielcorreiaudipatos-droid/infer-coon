import { Module } from '@nestjs/common';
import { StreamersService } from './streamers.service';
import { StreamersController } from './streamers.controller';
import { PrismaService } from '../../common/services/prisma.service';

@Module({
  controllers: [StreamersController],
  providers: [StreamersService, PrismaService],
})
export class StreamersModule {}
