import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { StreamsService } from './streams.service';

@ApiTags('Streams')
@Controller('streams')
export class StreamsController {
  constructor(private streamsService: StreamsService) {}

  @Get('current')
  async getCurrentStream() {
    return this.streamsService.getCurrentStream();
  }

  @Get('schedule')
  async getSchedule() {
    return this.streamsService.getSchedule();
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('watch/start')
  async startWatching(@Request() req, @Body() { streamId }: any) {
    return this.streamsService.startWatching(req.user.userId, streamId);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('watch/end/:sessionId')
  async endWatching(@Param('sessionId') sessionId: string) {
    return this.streamsService.endWatching(sessionId);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('stats')
  async getUserStats(@Request() req) {
    return this.streamsService.getUserStats(req.user.userId);
  }
}
