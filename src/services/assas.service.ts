import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { PrismaService } from '../database/prisma.service';

interface AssasCustomer {
  id?: string;
  email: string;
  name: string;
  cpfCnpj: string;
  mobilePhone?: string;
  address?: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

interface AssasTransfer {
  id?: string;
  customerId: string;
  amount: number;
  description?: string;
  bankAccount?: {
    bankCode: string;
    accountNumber: string;
    accountDigit: string;
    agencyNumber: string;
  };
}

@Injectable()
export class AssasService {
  private client: AxiosInstance;

  constructor(private prisma: PrismaService) {
    const baseURL = process.env.ASSAS_SANDBOX === 'true'
      ? 'https://sandbox.asaas.com/api/v3'
      : 'https://www.asaas.com/api/v3';

    this.client = axios.create({
      baseURL,
      headers: {
        'access_token': process.env.ASSAS_API_KEY,
        'Content-Type': 'application/json',
      },
    });
  }

  async createCustomer(data: AssasCustomer) {
    try {
      const response = await this.client.post('/customers', {
        name: data.name,
        email: data.email,
        cpfCnpj: data.cpfCnpj,
        mobilePhone: data.mobilePhone,
        address: data.address,
      });

      return response.data;
    } catch (error) {
      console.error('Assas create customer error:', error.response?.data || error.message);
      throw error;
    }
  }

  async getCustomer(customerId: string) {
    try {
      const response = await this.client.get(`/customers/${customerId}`);
      return response.data;
    } catch (error) {
      console.error('Assas get customer error:', error);
      throw error;
    }
  }

  async createTransfer(data: AssasTransfer) {
    try {
      const response = await this.client.post('/transfers', {
        customerId: data.customerId,
        amount: data.amount,
        description: data.description || 'Payout',
        bankAccount: data.bankAccount,
      });

      // Log transfer
      await this.prisma.payout.create({
        data: {
          assasTransferId: response.data.id,
          amount: data.amount,
          status: 'pending',
          createdAt: new Date(),
        },
      });

      return response.data;
    } catch (error) {
      console.error('Assas create transfer error:', error.response?.data || error.message);
      throw error;
    }
  }

  async getTransfer(transferId: string) {
    try {
      const response = await this.client.get(`/transfers/${transferId}`);
      return response.data;
    } catch (error) {
      console.error('Assas get transfer error:', error);
      throw error;
    }
  }

  async handleWebhook(data: any) {
    try {
      const { id, object, event } = data;

      if (object === 'transfer') {
        const transfer = await this.getTransfer(id);

        // Update payout status
        await this.prisma.payout.update({
          where: { assasTransferId: id },
          data: {
            status: transfer.status,
            completedAt: transfer.effectiveDate ? new Date(transfer.effectiveDate) : undefined,
          },
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Assas webhook error:', error);
      throw error;
    }
  }

  async validateCPF(cpf: string): Promise<boolean> {
    // Remove non-digits
    const digits = cpf.replace(/\D/g, '');

    // Check length
    if (digits.length !== 11) {
      return false;
    }

    // Check if all digits are same
    if (/^(\d)\1{10}$/.test(digits)) {
      return false;
    }

    // Validate check digits
    let sum = 0;
    let remainder = 0;

    for (let i = 1; i <= 9; i++) {
      sum += parseInt(digits.substring(i - 1, i)) * (11 - i);
    }

    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) {
      remainder = 0;
    }

    if (remainder !== parseInt(digits.substring(9, 10))) {
      return false;
    }

    sum = 0;
    for (let i = 1; i <= 10; i++) {
      sum += parseInt(digits.substring(i - 1, i)) * (12 - i);
    }

    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) {
      remainder = 0;
    }

    return remainder === parseInt(digits.substring(10, 11));
  }
}
