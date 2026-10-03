import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class HealthService {
  constructor(private prisma: PrismaService) {}

  async check() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: 'connected',
        environment: process.env.NODE_ENV || 'development',
        version: '1.0.0',
      };
    } catch (error) {
      return {
        status: 'degraded',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        error: error.message,
      };
    }
  }
}
