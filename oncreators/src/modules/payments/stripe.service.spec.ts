import { Test, TestingModule } from '@nestjs/testing';
import { StripeService } from './stripe.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('StripeService', () => {
  let service: StripeService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StripeService,
        {
          provide: PrismaService,
          useValue: {
            payment: { create: jest.fn(), updateMany: jest.fn() },
            subscriptionPlan: { findUnique: jest.fn() },
          },
        },
      ],
    }).compile();

    service = module.get<StripeService>(StripeService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create payment intent', async () => {
    const intent = await service.createPaymentIntent('user-123', 99.90);
    expect(intent).toHaveProperty('id');
    expect(intent).toHaveProperty('amount');
  });

  it('should handle payment success', async () => {
    const result = await service.confirmPayment('pi_test_success');
    expect(result.success).toBeDefined();
  });
});
