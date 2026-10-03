import { Module } from '@nestjs/common';
import { TVService } from './tv.service';
import { TVController } from './tv.controller';

@Module({
  controllers: [TVController],
  providers: [TVService],
  exports: [TVService],
})
export class TVModule {}
