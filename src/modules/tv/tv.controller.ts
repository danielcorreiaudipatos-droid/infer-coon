import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TVService } from './tv.service';
import { CurrentUser } from '@/decorators/current-user.decorator';

@Controller('api/tv')
export class TVController {
  constructor(private tvService: TVService) {}

  @Get('stream')
  async getCurrentStream() {
    return await this.tvService.getCurrentStream();
  }

  @Get('schedule')
  async getSchedule() {
    return await this.tvService.getSchedule();
  }

  @Get('quotes')
  async getQuotes() {
    return await this.tvService.getQuotes();
  }

  @Get('leaderboard')
  async getLeaderboard() {
    return await this.tvService.getLeaderboard();
  }

  @Post('watch/start')
  @UseGuards(AuthGuard('jwt'))
  async startWatching(
    @CurrentUser() user: any,
    @Body() { stream_id }: { stream_id: string }
  ) {
    return await this.tvService.startWatching(user.id, stream_id);
  }

  @Post('watch/end/:sessionId')
  @UseGuards(AuthGuard('jwt'))
  async endWatching(
    @CurrentUser() user: any,
    @Param('sessionId') sessionId: string
  ) {
    return await this.tvService.endWatching(user.id, sessionId);
  }

  @Get('stats')
  @UseGuards(AuthGuard('jwt'))
  async getStats(@CurrentUser() user: any) {
    return await this.tvService.getUserStats(user.id);
  }
}
