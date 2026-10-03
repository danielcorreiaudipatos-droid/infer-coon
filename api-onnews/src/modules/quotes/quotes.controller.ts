import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { QuotesService } from './quotes.service';

@ApiTags('Quotes')
@Controller('quotes')
export class QuotesController {
  constructor(private quotesService: QuotesService) {}

  @Get()
  async getQuotes() {
    return this.quotesService.getQuotes();
  }

  @Get(':symbol/history')
  async getHistory(@Param('symbol') symbol: string, @Query('limit') limit = 100) {
    return this.quotesService.getQuoteHistory(symbol, limit);
  }
}
