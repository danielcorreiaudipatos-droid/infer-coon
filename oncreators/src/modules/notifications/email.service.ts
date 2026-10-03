import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class EmailService {
  private sendGridApiKey = process.env.SENDGRID_API_KEY;
  private fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@oncreators.com';

  constructor(private prisma: PrismaService) {}

  async sendWelcomeEmail(email: string, name: string) {
    return this.sendEmail({
      to: email,
      subject: 'Welcome to OnCreators!',
      html: `
        <h1>Welcome ${name}!</h1>
        <p>Thank you for joining OnCreators, the premium creator marketplace.</p>
        <p>Get started by exploring our creators and premium content.</p>
        <a href="https://oncreators.com/premium">Go Premium</a>
      `,
    });
  }

  async sendPaymentConfirmation(email: string, amount: number, orderId: string) {
    return this.sendEmail({
      to: email,
      subject: `Payment Confirmation - R$ ${amount.toFixed(2)}`,
      html: `
        <h2>Payment Confirmed</h2>
        <p>Your payment of <strong>R$ ${amount.toFixed(2)}</strong> has been confirmed.</p>
        <p>Order ID: ${orderId}</p>
        <p>Thank you for your purchase!</p>
      `,
    });
  }

  async sendSubscriptionEmail(email: string, planName: string) {
    return this.sendEmail({
      to: email,
      subject: `${planName} Subscription Activated`,
      html: `
        <h2>Subscription Activated!</h2>
        <p>Your ${planName} subscription is now active.</p>
        <p>Enjoy premium content, signals, and exclusive community access.</p>
        <a href="https://oncreators.com/dashboard">Go to Dashboard</a>
      `,
    });
  }

  async sendInvoiceEmail(email: string, invoiceUrl: string, amount: number) {
    return this.sendEmail({
      to: email,
      subject: `Invoice - R$ ${amount.toFixed(2)}`,
      html: `
        <h2>Your Invoice</h2>
        <p>Amount: <strong>R$ ${amount.toFixed(2)}</strong></p>
        <p><a href="${invoiceUrl}">Download Invoice</a></p>
      `,
    });
  }

  async sendContentNotification(email: string, contentTitle: string, creatorName: string) {
    return this.sendEmail({
      to: email,
      subject: `New Content: ${contentTitle}`,
      html: `
        <h2>New Content Available!</h2>
        <p><strong>${creatorName}</strong> published new content: <strong>${contentTitle}</strong></p>
        <p><a href="https://oncreators.com/content">Watch Now</a></p>
      `,
    });
  }

  private async sendEmail(options: { to: string; subject: string; html: string }) {
    try {
      console.log(`Email queued: ${options.to} - ${options.subject}`);

      // In production, integrate with SendGrid
      // For now, just log it
      return { success: true, messageId: `msg_${Date.now()}` };
    } catch (error) {
      console.error('Email send failed:', error);
      return { success: false, error };
    }
  }
}
