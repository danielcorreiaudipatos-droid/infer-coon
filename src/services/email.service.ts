import { Injectable } from '@nestjs/common';
import * as sgMail from '@sendgrid/mail';
import { PrismaService } from '../database/prisma.service';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
  tags?: string[];
}

@Injectable()
export class EmailService {
  constructor(private prisma: PrismaService) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const msg = {
        to: options.to,
        from: options.from || process.env.SENDGRID_FROM_EMAIL || 'noreply@infer-coon.com',
        subject: options.subject,
        html: options.html,
        replyTo: options.replyTo,
        categories: options.tags || [],
        trackingSettings: {
          clickTracking: {
            enable: true,
          },
          openTracking: {
            enable: true,
          },
        },
      };

      await sgMail.send(msg);

      // Log email sent
      await this.prisma.emailLog.create({
        data: {
          to: options.to,
          subject: options.subject,
          status: 'sent',
          sentAt: new Date(),
        },
      });

      return true;
    } catch (error) {
      console.error('SendGrid error:', error);

      // Log email failure
      await this.prisma.emailLog.create({
        data: {
          to: options.to,
          subject: options.subject,
          status: 'failed',
          error: error.message,
          sentAt: new Date(),
        },
      });

      return false;
    }
  }

  async sendBulkEmail(
    recipients: string[],
    subject: string,
    html: string,
    tags?: string[],
  ): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const email of recipients) {
      const result = await this.sendEmail({
        to: email,
        subject,
        html,
        tags,
      });

      if (result) {
        success++;
      } else {
        failed++;
      }

      // Rate limiting: 10 emails per second
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return { success, failed };
  }

  async sendWelcomeEmail(email: string, name: string): Promise<boolean> {
    const html = `
      <h1>Bem-vindo ao Infer Coon! 🎉</h1>
      <p>Olá ${name},</p>
      <p>Sua conta foi criada com sucesso.</p>
      <p>Você pode começar a usar ONZAP, ONLOVE, ONMAIL e WALLET agora mesmo.</p>
      <a href="${process.env.APP_URL}/dashboard" style="padding: 10px 20px; background: #00D084; color: white; text-decoration: none; border-radius: 5px;">
        Ir para Dashboard
      </a>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Bem-vindo ao Infer Coon!',
      html,
      tags: ['welcome'],
    });
  }

  async sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
    const resetUrl = `${process.env.APP_URL}/reset-password?token=${resetToken}`;

    const html = `
      <h2>Redefinir Senha</h2>
      <p>Recebemos uma solicitação para redefinir sua senha.</p>
      <p>Clique no link abaixo para criar uma nova senha:</p>
      <a href="${resetUrl}" style="padding: 10px 20px; background: #0066FF; color: white; text-decoration: none; border-radius: 5px;">
        Redefinir Senha
      </a>
      <p>Este link expira em 24 horas.</p>
      <p>Se não solicitou isso, ignore este email.</p>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Redefinir sua senha',
      html,
      tags: ['password-reset'],
    });
  }

  async trackEmailOpen(emailLogId: string) {
    await this.prisma.emailLog.update({
      where: { id: emailLogId },
      data: {
        opened: true,
        openedAt: new Date(),
      },
    });
  }

  async trackEmailClick(emailLogId: string, url: string) {
    await this.prisma.emailLog.update({
      where: { id: emailLogId },
      data: {
        clicked: true,
        clickedAt: new Date(),
      },
    });

    await this.prisma.emailClick.create({
      data: {
        emailLogId,
        url,
        clickedAt: new Date(),
      },
    });
  }

  async handleBounce(email: string) {
    await this.prisma.user.update({
      where: { email },
      data: {
        bounced: true,
        bouncedAt: new Date(),
      },
    });
  }

  async handleUnsubscribe(email: string) {
    await this.prisma.user.update({
      where: { email },
      data: {
        unsubscribed: true,
        unsubscribedAt: new Date(),
      },
    });
  }
}
