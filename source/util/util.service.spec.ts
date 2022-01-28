import { AppModule } from '../app/app.module';
import { UtilService } from './util.service';

// eslint-disable-next-line @typescript-eslint/require-await
const mockFailure = async (c): Promise<void> => {
  c.quantity++;
  throw new Error('error');
};

describe('UtilService', () => {
  let utilService: UtilService;

  beforeAll(async () => {
    const app = await AppModule.compile({ disableModuleScan: true, disableLogger: true });
    utilService = app.get(UtilService);
  });

  describe('sleep', () => {
    it('should sleep code execution for 1000ms', async () => {
      const sleepTime = 1000;
      const start = Date.now();
      await utilService.sleep(sleepTime);
      const elapsed = Date.now() - start;
      expect(elapsed).toBeGreaterThan(sleepTime * 0.95);
      expect(elapsed).toBeLessThan(sleepTime * 1.05);
    });
  });

  describe('retryOnException', () => {
    it('should retry a method for 5 times', async () => {
      const counter = { quantity: 0 };
      const retries = 5;

      try {
        await utilService.retryOnException({
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
        await utilService.retryOnException({
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
        await utilService.retryOnException({
          method: () => utilService.sleep(2000),
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
        await utilService.retryOnException({
          method: () => mockFailure(counter),
          retries,
        });
      }
      catch { /* Handled by expect */ }

      expect(counter.quantity).toBe(1);
    });
  });
});

