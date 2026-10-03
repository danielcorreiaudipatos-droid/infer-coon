import { Module } from '@nestjs/common';
import { StreamsService } from './streams.service';
import { StreamsController } from './streams.controller';
import { PrismaService } from '../../common/services/prisma.service';

@Module({
  controllers: [StreamsController],
  providers: [StreamsService, PrismaService],
})
export class StreamsModule {}
