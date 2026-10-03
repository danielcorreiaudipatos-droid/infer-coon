import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { MarketplaceService } from './marketplace.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Marketplace')
@Controller('marketplace')
export class MarketplaceController {
  constructor(private readonly service: MarketplaceService) {}

  @Get()
  async getProducts() {
    return this.service.getProducts();
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.service.getById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async create(@Request() req: any, @Body() data: any) {
    return this.service.createProduct(req.user.id, data);
  }

  @Post(':id/purchase')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async purchase(@Request() req: any, @Param('id') productId: string) {
    return this.service.purchaseProduct(req.user.id, productId);
  }

  @Get('purchases/me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getPurchases(@Request() req: any) {
    return this.service.getPurchases(req.user.id);
  }
}
