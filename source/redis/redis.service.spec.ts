import { randomUUID } from 'crypto';

import { AppModule } from '../app/app.module';
import { RedisModule } from './redis.module';
import { RedisService } from './redis.service';

describe('RedisService', () => {
  let redisService: RedisService;
  const testObjectKey: string = randomUUID();
  const testBufferKey: string = randomUUID();
  const randomNumber = Math.random();
  const randomBuffer = Buffer.from(randomUUID(), 'utf8');

  beforeAll(async () => {
    const app = await AppModule.compile({
      disableAll: true,
      imports: [
        RedisModule.register({
          host: 'localhost',
          port: 6379,
        }),
      ],
    });

    redisService = await app.resolve(RedisService);
  });

  describe('set', () => {
    it('should obey skip if not exist rule', async () => {
      await redisService.set(testObjectKey, { rng: randomNumber }, { skip: 'IF_NOT_EXIST' });
      const storedNumber = await redisService.get(testObjectKey);
      expect(storedNumber).toBeNull();
    });

    it('should persist a random number', async () => {
      expect(await redisService.set(testObjectKey, { rng: randomNumber })).toBeUndefined();
    });

    it('should persist a random buffer', async () => {
      expect(await redisService.set(testBufferKey, randomBuffer)).toBeUndefined();
    });

    it('should obey skip if exist rule', async () => {
      await redisService.set(testObjectKey, Math.random(), { skip: 'IF_EXIST' });
      const storedNumber = await redisService.get(testObjectKey);
      expect(storedNumber).toMatchObject({ rng: randomNumber });
    });
  });

  describe('get', () => {
    it('should read persisted random number', async () => {
      const storedNumber = await redisService.get(testObjectKey);
      expect(storedNumber).toMatchObject({ rng: randomNumber });
    });

    it('should read persisted random buffer', async () => {
      const storedBuffer = await redisService.getBuffer(testBufferKey);
      expect(storedBuffer).toEqual(randomBuffer);
    });
  });

  describe('del', () => {
    it('should delete persisted random number', async () => {
      await redisService.del(testObjectKey);
      const testValue = await redisService.get(testObjectKey);
      expect(testValue).toBeNull();
    });
  });

  describe('incrbyfloat', () => {
    it('should increment a key by integer amount', async () => {
      const incrementKey: string = randomUUID();
      const interactions = Math.floor(Math.random() * (100 - 50 + 1)) + 50;
      const incrementAmount = 1;

      for (let i = 0; i < interactions; i++) {
        void redisService.incrbyfloat(incrementKey, incrementAmount);
      }

      const testValue = await redisService.get(incrementKey);
      expect(testValue).toBe(interactions * incrementAmount);
    });

    it('should increment a key by float amount', async () => {
      const incrementKey: string = randomUUID();
      const scale = 12;
      const interactions = Math.floor(Math.random() * (100 - 50 + 1)) + 50;
      const incrementAmount = Number.parseFloat(Math.random().toFixed(scale));

      for (let i = 0; i < interactions; i++) {
        void redisService.incrbyfloat(incrementKey, incrementAmount);
      }

      const testValue: number = await redisService.get(incrementKey);
      expect(testValue.toFixed(scale)).toBe((interactions * incrementAmount).toFixed(scale));
    });

    it('should increment a key without resetting ttl', async () => {
      const incrementKey: string = randomUUID();

      for (let i = 0; i < 10; i++) {
        void redisService.incrbyfloat(incrementKey, 1, { ttl: 2000 });
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      await new Promise((resolve) => setTimeout(resolve, 1100));

      const testValue = await redisService.get(incrementKey);
      expect(testValue).toBeNull();
    });

    it('should decrement a key if input is negative', async () => {
      const incrementKey: string = randomUUID();

      await redisService.incrbyfloat(incrementKey, 10);
      await redisService.incrbyfloat(incrementKey, -3);

      const testValue = await redisService.get(incrementKey);
      expect(testValue).toBe(7);
    });
  });

  describe('lock', () => {
    it('should disallow locking the same key at the same time', async () => {
      const lockKey: string = randomUUID();
      const start = Date.now();
      const ttl = 500;
      const instances = 5;
      const lockPromises = [ ];

      for (let i = 0; i < instances; i++) {
        lockPromises.push(
          redisService.lock(lockKey, { ttl }),
        );
      }

      await Promise.all(lockPromises);

      const elapsed = Date.now() - start;
      expect(elapsed).toBeGreaterThan(ttl * (instances - 1));
    });

    it('should allow locking the same key if it has been unlocked', async () => {
      const lockKey: string = randomUUID();
      const start = Date.now();
      const ttl = 5000;

      await redisService.lock(lockKey, { ttl });
      await redisService.unlock(lockKey);
      await redisService.lock(lockKey, { ttl });

      const elapsed = Date.now() - start;
      expect(elapsed).toBeLessThan(ttl);
    });

    it('should try once and throw if retries are zero', async () => {
      const lockKey: string = randomUUID();
      const ttl = 1000;
      let exception: boolean;

      await redisService.lock(lockKey, { ttl });

      try {
        await redisService.lock(lockKey, {
          retries: 0,
          delay: ttl * 2,
          ttl,
        });
      }
      catch {
        exception = true;
      }

      expect(exception).toBeTruthy();
    });
  });
});
