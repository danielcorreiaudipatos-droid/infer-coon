import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../src/modules/auth/auth.service';
import { PrismaService } from '../src/common/services/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

const mockJwtService = {
  sign: jest.fn(() => 'test-token'),
};

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findFirst: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
            wallet: {
              create: jest.fn(),
            },
            userAnalytics: {
              create: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const user = {
        id: '123',
        email: 'test@example.com',
        username: 'testuser',
      };

      (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.user.create as jest.Mock).mockResolvedValue(user);
      (prisma.wallet.create as jest.Mock).mockResolvedValue({});
      (prisma.userAnalytics.create as jest.Mock).mockResolvedValue({});
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

      const result = await service.register({
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        bio: 'Test user',
      });

      expect(result.access_token).toBe('test-token');
      expect(result.user.email).toBe('test@example.com');
    });

    it('should throw if user already exists', async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue({
        id: '123',
      });

      await expect(
        service.register({
          email: 'test@example.com',
          username: 'testuser',
          password: 'password123',
        }),
      ).rejects.toThrow('Email or username already exists');
    });
  });

  describe('login', () => {
    it('should login user and return token', async () => {
      const user = {
        id: '123',
        email: 'test@example.com',
        username: 'testuser',
        passwordHash: 'hashed-password',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.access_token).toBe('test-token');
      expect(result.user.email).toBe('test@example.com');
    });

    it('should throw if credentials are invalid', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        service.login({
          email: 'test@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow('Invalid credentials');
    });
  });
});
