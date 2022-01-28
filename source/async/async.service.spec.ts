import { AppModule } from '../app/app.module';
import { AsyncModule } from './async.module';
import { AsyncService } from './async.service';

// eslint-disable-next-line @typescript-eslint/require-await
const mockFailure = async (c): Promise<void> => {
  c.quantity++;
  throw new Error('error');
};

describe('AsyncService', () => {
  let asyncService: AsyncService;

  beforeAll(async () => {
    const app = await AppModule.compile({
      disableModuleScan: true,
      disableLogger: true,
      imports: [ AsyncModule ],
    });

    asyncService = app.get(AsyncService);
  });

  describe('sleep', () => {
    it('should sleep code execution for 1000ms', async () => {
      const sleepTime = 1000;
      const start = Date.now();
      await asyncService.sleep(sleepTime);
      const elapsed = Date.now() - start;
      expect(elapsed).toBeGreaterThan(sleepTime * 0.95);
      expect(elapsed).toBeLessThan(sleepTime * 1.05);
    });
  });

  describe('resolveLimited', () => {
    it('should restrict resolution if over limit', async () => {
      const start = Date.now();

      await asyncService.resolveLimited({
        data: [ 100, 200, 300, 400 ],
        method: (t) => asyncService.sleep(t),
        limit: 1,
      });

      const elapsed = Date.now() - start;
      expect(elapsed).toBeGreaterThan(900);
    });

    it('should resolve in parallel if within limit', async () => {
      const start = Date.now();

      await asyncService.resolveLimited({
        data: [ 100, 200, 300, 400 ],
        method: (t) => asyncService.sleep(t),
        limit: 4,
      });

      const elapsed = Date.now() - start;
      expect(elapsed).toBeLessThan(500);
    });
  });

  describe('retryOnException', () => {
    it('should retry a method for 5 times', async () => {
      const counter = { quantity: 0 };
      const retries = 5;

      try {
        await asyncService.retryOnException({
          method: () => mockFailure(counter),
          retries,
        });
      }
      catch { /* Handled by expect */ }

      expect(counter.quantity).toBe(retries + 1);
    });

    it('should retry a method for 2 seconds', async () => {
      const counter = { quantity: 0 };
      const timeout = 2000;
      const delay = 550;

      try {
        await asyncService.retryOnException({
          method: () => mockFailure(counter),
          timeout,
          delay,
        });
      }
      catch { /* Handled by expect */ }

      expect(counter.quantity).toBe(Math.ceil(timeout / delay) + 1);
    });

    it('should timeout a method after 1 second', async () => {
      const start = Date.now();
      const timeout = 1000;

      try {
        await asyncService.retryOnException({
          method: () => asyncService.sleep(2000),
          timeout,
        });
      }
      catch { /* Handled by expect */ }

      const elapsed = Date.now() - start;
      expect(elapsed).toBeLessThan(timeout * 1.1);
    });

    it('should not retry a method', async () => {
      const counter = { quantity: 0 };
      const retries = 0;

      try {
        await asyncService.retryOnException({
          method: () => mockFailure(counter),
          retries,
        });
      }
      catch { /* Handled by expect */ }

      expect(counter.quantity).toBe(1);
    });
  });
});

