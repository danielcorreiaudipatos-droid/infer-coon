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
import { ONMAILGameService } from './onmail.service';

@Controller('api/games/onmail')
@UseGuards(JwtAuthGuard)
export class ONMAILGameController {
  constructor(private gameService: ONMAILGameService) {}

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
    const { sessionId, score, wavesCompleted, towersBuilt } = body;

    if (!sessionId || score === undefined || wavesCompleted === undefined) {
      throw new BadRequestException('sessionId, score, and wavesCompleted are required');
    }

    if (!Number.isInteger(score) || score < 0) {
      throw new BadRequestException('score must be a non-negative integer');
    }

    if (wavesCompleted < 0 || wavesCompleted > 20) {
      throw new BadRequestException('wavesCompleted must be between 0 and 20');
    }

    try {
      const result = await this.gameService.endGame(
        req.user.id,
        sessionId,
        score,
        wavesCompleted,
        towersBuilt || 0
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
