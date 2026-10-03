import { Injectable } from '@nestjs/common';
import * as twilio from 'twilio';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class TwilioService {
  private client: twilio.Twilio;
  private whatsappFromNumber: string;

  constructor(private prisma: PrismaService) {
    this.client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN,
    );

    this.whatsappFromNumber = `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`;
  }

  async sendWhatsappMessage(
    to: string,
    body: string,
    mediaUrl?: string,
  ): Promise<string> {
    try {
      // Format phone number
      const formattedTo = `whatsapp:${to.replace(/\D/g, '')}`;

      const messageData: any = {
        from: this.whatsappFromNumber,
        to: formattedTo,
        body,
      };

      if (mediaUrl) {
        messageData.mediaUrl = [mediaUrl];
      }

      const message = await this.client.messages.create(messageData);

      // Log message
      await this.prisma.whatsappMessage.create({
        data: {
          twilioSid: message.sid,
          to: to,
          body: body,
          status: message.status,
          sentAt: new Date(),
        },
      });

      return message.sid;
    } catch (error) {
      console.error('Twilio send message error:', error);
      throw error;
    }
  }

  async getMessageStatus(messageSid: string): Promise<string> {
    try {
      const message = await this.client.messages(messageSid).fetch();
      return message.status;
    } catch (error) {
      console.error('Twilio get message status error:', error);
      throw error;
    }
  }

  async sendBulkWhatsapp(
    recipients: { phone: string; body: string }[],
  ): Promise<{ success: number; failed: number; sids: string[] }> {
    let success = 0;
    let failed = 0;
    const sids: string[] = [];

    for (const recipient of recipients) {
      try {
        const sid = await this.sendWhatsappMessage(recipient.phone, recipient.body);
        success++;
        sids.push(sid);
      } catch (error) {
        console.error(`Failed to send to ${recipient.phone}:`, error);
        failed++;
      }

      // Rate limiting: 1 message per second
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return { success, failed, sids };
  }

  async handleWebhook(data: any) {
    try {
      const { MessageSid, MessageStatus, From, Body } = data;

      // Update message status
      await this.prisma.whatsappMessage.update({
        where: { twilioSid: MessageSid },
        data: {
          status: MessageStatus,
          updatedAt: new Date(),
        },
      });

      // If delivered/read, maybe do something
      if (MessageStatus === 'delivered' || MessageStatus === 'read') {
        // Could trigger analytics, notification, etc
      }

      return { success: true };
    } catch (error) {
      console.error('Twilio webhook error:', error);
      throw error;
    }
  }

  async validatePhoneNumber(phoneNumber: string): Promise<boolean> {
    try {
      const lookups = await this.client.lookups.v1.phoneNumbers(phoneNumber).fetch({
        type: 'carrier',
      });

      return lookups.phoneNumber ? true : false;
    } catch (error) {
      console.error('Phone number validation error:', error);
      return false;
    }
  }

  async formatPhoneNumber(phone: string): Promise<string> {
    // Remove non-digits
    const digits = phone.replace(/\D/g, '');

    // If starts with 55 (Brazil code), keep as is
    if (digits.startsWith('55')) {
      return digits;
    }

    // If starts with 0, remove it and add 55
    if (digits.startsWith('0')) {
      return '55' + digits.substring(1);
    }

    // Otherwise add 55
    return '55' + digits;
  }

  async sendTemplate(
    to: string,
    templateName: string,
    templateData?: Record<string, string>,
  ): Promise<string> {
    let body = this.getTemplateBody(templateName, templateData);
    return this.sendWhatsappMessage(to, body);
  }

  private getTemplateBody(
    templateName: string,
    data?: Record<string, string>,
  ): string {
    const templates: Record<string, string> = {
      welcome: `Bem-vindo ao Infer Coon! 🎉\n\nVocê está pronto para começar a usar ONZAP, ONLOVE, ONMAIL e WALLET.\n\nAcesse: ${data?.appUrl || 'https://app.infer-coon.com'}`,

      onzap_pitch: `Olá ${data?.name || 'there'}! 👋\n\nVimos que você trabalha em ${data?.company || 'uma empresa'}.\n\nGostaria de conhecer ONZAP? Automação de vendas via WhatsApp com +40% de conversão.\n\nPodemos conversar? 💬`,

      onlove_pitch: `Olá ${data?.name || 'creator'}! 💰\n\nVista como montar uma comunidade e ganhar dinheiro?\n\nONLOVE te ajuda a:\n✅ Monetizar sua audiência\n✅ Criar conteúdo exclusivo\n✅ Ter comunidade engajada\n\nVamos conversar?`,

      onmail_pitch: `Olá ${data?.name || 'there'}! 📧\n\nSeu email é seu maior ativo.\n\nONMAIL ajuda a:\n✅ Enviar campanhas pro\n✅ Rastrear aberturas\n✅ Converter seguidores\n\nInteressado?`,
    };

    return templates[templateName] || 'Olá! Como posso ajudar?';
  }
}
