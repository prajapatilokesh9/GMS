import Redis from 'ioredis';
import { config } from './index';

let redisInstance: Redis | null = null;

export function getRedis(): Redis {
  if (!redisInstance) {
    redisInstance = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    });
  }
  return redisInstance;
}

export async function closeRedis(): Promise<void> {
  if (redisInstance) {
    await redisInstance.quit();
    redisInstance = null;
  }
}
