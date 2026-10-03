import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { WalletService } from './wallet.service';

@ApiTags('Wallet')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('wallet')
export class WalletController {
  constructor(private walletService: WalletService) {}

  @Get()
  async getWallet(@Request() req) {
    return this.walletService.getWallet(req.user.userId);
  }

  @Get('transactions')
  async getTransactions(
    @Request() req,
    @Query('limit') limit = 20,
    @Query('offset') offset = 0,
  ) {
    return this.walletService.getTransactions(req.user.userId, limit, offset);
  }
}
