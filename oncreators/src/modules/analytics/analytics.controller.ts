import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly service: AnalyticsService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getMyAnalytics(@Request() req: any) {
    return this.service.getMyAnalytics(req.user.id);
  }

  @Get('creator/:id')
  async getCreatorAnalytics(@Param('id') creatorId: string) {
    return this.service.getCreatorAnalytics(creatorId);
  }

  @Get('dashboard')
  async getDashboard() {
    return this.service.getDashboard();
  }
}
