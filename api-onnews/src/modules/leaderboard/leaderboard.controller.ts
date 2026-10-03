import { Controller, Get, Query, UseGuards, Request, Param } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { LeaderboardService } from './leaderboard.service';

@ApiTags('Leaderboard')
@Controller('leaderboard')
export class LeaderboardController {
  constructor(private leaderboardService: LeaderboardService) {}

  @Get()
  async getLeaderboard(@Query('period') period = 'all_time', @Query('limit') limit = 20) {
    return this.leaderboardService.getLeaderboard(period, limit);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('rank')
  async getUserRank(@Request() req, @Query('period') period = 'all_time') {
    return this.leaderboardService.getUserRank(req.user.userId, period);
  }
}
