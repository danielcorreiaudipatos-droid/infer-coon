import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly service: PaymentsService) {}

  @Post('webhook')
  async webhook(@Body() data: any) {
    return this.service.handleWebhook(data);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getPayments(@Request() req: any) {
    return this.service.getPayments(req.user.id);
  }

  @Get('invoices')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getInvoices(@Request() req: any) {
    return this.service.getInvoices(req.user.id);
  }

  @Post('record')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async recordPayment(@Request() req: any, @Body() data: any) {
    return this.service.recordPayment(req.user.id, data);
  }
}
