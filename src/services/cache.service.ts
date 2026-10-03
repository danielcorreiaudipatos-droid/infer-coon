import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class CacheService {
  private redis: Redis;
  private TTL = 3600; // 1 hour default

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    this.redis.on('error', (err) => {
      console.error('Redis error:', err);
    });

    this.redis.on('connect', () => {
      console.log('Redis connected');
    });
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl: number = this.TTL): Promise<void> {
    try {
      await this.redis.setex(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      console.error(`Cache del error for key ${key}:`, error);
    }
  }

  async invalidatePattern(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      console.error(`Cache invalidate pattern error:`, error);
    }
  }

  async incr(key: string): Promise<number> {
    try {
      return await this.redis.incr(key);
    } catch (error) {
      console.error(`Cache incr error for key ${key}:`, error);
      return 0;
    }
  }

  async decr(key: string): Promise<number> {
    try {
      return await this.redis.decr(key);
    } catch (error) {
      console.error(`Cache decr error for key ${key}:`, error);
      return 0;
    }
  }

  async expire(key: string, seconds: number): Promise<void> {
    try {
      await this.redis.expire(key, seconds);
    } catch (error) {
      console.error(`Cache expire error for key ${key}:`, error);
    }
  }

  // Rate limiting
  async checkRateLimit(
    userId: string,
    action: string,
    limit: number,
    window: number, // seconds
  ): Promise<boolean> {
    try {
      const key = `rate_limit:${userId}:${action}`;
      const current = await this.incr(key);

      if (current === 1) {
        await this.expire(key, window);
      }

      return current <= limit;
    } catch (error) {
      console.error(`Rate limit check error:`, error);
      return true; // Allow on error
    }
  }

  async getRateLimitRemaining(
    userId: string,
    action: string,
    limit: number,
  ): Promise<number> {
    try {
      const key = `rate_limit:${userId}:${action}`;
      const current = await this.redis.get(key);
      const count = current ? parseInt(current) : 0;
      return Math.max(0, limit - count);
    } catch (error) {
      console.error(`Rate limit remaining error:`, error);
      return limit;
    }
  }

  async disconnect(): Promise<void> {
    await this.redis.disconnect();
  }
}
