import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(private prisma: PrismaService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_demo', {
      apiVersion: '2023-10-16',
    });
  }

  async createPaymentIntent(userId: string, amount: number, metadata: any = {}) {
    return this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'brl',
      metadata: { userId, ...metadata },
      automatic_payment_methods: { enabled: true },
    });
  }

  async confirmPayment(paymentIntentId: string) {
    const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      const { userId } = paymentIntent.metadata;

      await this.prisma.payment.create({
        data: {
          userId,
          amount: paymentIntent.amount / 100,
          status: 'succeeded',
          stripePaymentId: paymentIntent.id,
          succeededAt: new Date(),
        },
      });

      return { success: true, paymentIntent };
    }

    return { success: false, status: paymentIntent.status };
  }

  async createSubscription(userId: string, planId: string, stripeCustomerId: string) {
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw new Error('Plan not found');
    }

    const subscription = await this.stripe.subscriptions.create({
      customer: stripeCustomerId,
      items: [
        {
          price_data: {
            currency: 'brl',
            product_data: { name: plan.name },
            recurring: { interval: 'month' },
            unit_amount: Math.round(plan.priceMonthly * 100),
          },
        },
      ],
      payment_settings: {
        save_default_payment_method: 'on_subscription',
      },
    });

    return subscription;
  }

  async handleWebhookEvent(event: any) {
    switch (event.type) {
      case 'payment_intent.succeeded':
        return this.handlePaymentSuccess(event.data.object);
      case 'invoice.payment_succeeded':
        return this.handleInvoiceSuccess(event.data.object);
      case 'customer.subscription.created':
        return this.handleSubscriptionCreated(event.data.object);
      default:
        return { handled: false };
    }
  }

  private async handlePaymentSuccess(paymentIntent: any) {
    const { userId } = paymentIntent.metadata;
    await this.prisma.payment.updateMany({
      where: { stripePaymentId: paymentIntent.id },
      data: { status: 'succeeded', succeededAt: new Date() },
    });
    return { handled: true };
  }

  private async handleInvoiceSuccess(invoice: any) {
    console.log('Invoice payment succeeded:', invoice.id);
    return { handled: true };
  }

  private async handleSubscriptionCreated(subscription: any) {
    console.log('Subscription created:', subscription.id);
    return { handled: true };
  }
}
