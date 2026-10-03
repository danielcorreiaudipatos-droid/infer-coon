import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  BadRequestException
} from '@nestjs/common';
import { JwtAuthGuard } from '@/auth/jwt.guard';
import { ONLOVEGameService } from './onlove.service';

@Controller('api/games/onlove')
@UseGuards(JwtAuthGuard)
export class ONLOVEGameController {
  constructor(private gameService: ONLOVEGameService) {}

  @Post('start')
  async startGame(@Request() req: any, @Body() body: any) {
    const { deviceId } = body;

    if (!deviceId) {
      throw new BadRequestException('deviceId is required');
    }

    try {
      const result = await this.gameService.startGame(req.user.id, deviceId);
      return {
        success: true,
        data: result
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  @Post('end')
  async endGame(@Request() req: any, @Body() body: any) {
    const { sessionId, score, matches, profilesViewed } = body;

    if (!sessionId || score === undefined || matches === undefined) {
      throw new BadRequestException('sessionId, score, and matches are required');
    }

    if (!Number.isInteger(score) || score < 0) {
      throw new BadRequestException('score must be a non-negative integer');
    }

    try {
      const result = await this.gameService.endGame(
        req.user.id,
        sessionId,
        score,
        matches,
        profilesViewed || 0
      );
      return {
        success: true,
        data: result
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  @Get('leaderboard')
  async getLeaderboard() {
    try {
      const leaderboard = await this.gameService.getLeaderboard(100);
      return {
        success: true,
        data: leaderboard
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  @Get('stats')
  async getStats(@Request() req: any) {
    try {
      const stats = await this.gameService.getUserStats(req.user.id);
      return {
        success: true,
        data: stats
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}
