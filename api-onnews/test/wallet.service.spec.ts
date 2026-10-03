import { Test, TestingModule } from '@nestjs/testing';
import { WalletService } from '../src/modules/wallet/wallet.service';
import { PrismaService } from '../src/common/services/prisma.service';

describe('WalletService', () => {
  let service: WalletService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletService,
        {
          provide: PrismaService,
          useValue: {
            wallet: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            transaction: {
              findMany: jest.fn(),
              count: jest.fn(),
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<WalletService>(WalletService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('getWallet', () => {
    it('should return wallet', async () => {
      const wallet = {
        id: '123',
        balance: 100.50,
        totalEarned: 500.00,
      };

      (prisma.wallet.findUnique as jest.Mock).mockResolvedValue(wallet);

      const result = await service.getWallet('user123');

      expect(result.balance).toBe(100.50);
      expect(result.totalEarned).toBe(500.00);
    });
  });

  describe('creditWallet', () => {
    it('should credit wallet and create transaction', async () => {
      const wallet = { id: 'wallet123' };
      const updatedWallet = { balance: 150.50 };
      const transaction = { id: 'tx123', amount: 50.00 };

      (prisma.wallet.findUnique as jest.Mock).mockResolvedValue(wallet);
      (prisma.wallet.update as jest.Mock).mockResolvedValue(updatedWallet);
      (prisma.transaction.create as jest.Mock).mockResolvedValue(transaction);

      const result = await service.creditWallet('user123', 50.00, 'watch_earning', 'Watch earnings');

      expect(result.wallet.balance).toBe(150.50);
      expect(result.transaction.amount).toBe(50.00);
    });
  });
});
