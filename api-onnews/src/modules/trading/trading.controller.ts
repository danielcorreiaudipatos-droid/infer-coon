import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { TradingService } from './trading.service';

@ApiTags('Trading')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('trading')
export class TradingController {
  constructor(private tradingService: TradingService) {}

  @Get('account')
  async getAccount(@Request() req) {
    return this.tradingService.getTradingAccount(req.user.userId);
  }

  @Post('predict')
  async makePrediction(@Request() req, @Body() data: any) {
    return this.tradingService.makePrediction(req.user.userId, data);
  }

  @Get('predictions')
  async getPredictions(@Request() req) {
    return this.tradingService.getPredictions(req.user.userId);
  }
}
