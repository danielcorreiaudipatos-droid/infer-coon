import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async recordPayment(userId: string, data: any) {
    return this.prisma.payment.create({
      data: {
        userId,
        amount: data.amount,
        status: 'succeeded',
        paymentMethod: data.paymentMethod,
        last4Digits: data.last4Digits,
        stripePaymentId: data.stripePaymentId,
        succeededAt: new Date(),
      },
    });
  }

  async getPayments(userId: string) {
    return this.prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getInvoices(userId: string) {
    return this.prisma.invoice.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async handleWebhook(data: any) {
    if (data.type === 'payment_intent.succeeded') {
      return { message: 'Payment processed', status: 'success' };
    }
    return { message: 'Webhook received' };
  }
}
