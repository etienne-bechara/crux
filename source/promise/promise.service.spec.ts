import { setTimeout } from 'timers/promises';

import { AppModule } from '../app/app.module';
import { CacheModule } from '../override';
import { PromiseModule } from './promise.module';
import { PromiseService } from './promise.service';

// eslint-disable-next-line @typescript-eslint/require-await
const mockFailure = async (c): Promise<void> => {
  c.quantity++;
  throw new Error('error');
};

describe('PromiseService', () => {
  let promiseService: PromiseService;

  beforeAll(async () => {
    const app = await AppModule.compile({
      disableScan: true,
      disableLogs: true,
      disableMetrics: true,
      disableTraces: true,
      imports: [ PromiseModule, CacheModule ],
    });

    promiseService = app.get(PromiseService);
  });

  describe('sleep', () => {
    it('should sleep code execution for 1000ms', async () => {
      const sleepTime = 1000;
      const start = Date.now();
      await promiseService.sleep(sleepTime);
      const elapsed = Date.now() - start;
      expect(elapsed).toBeGreaterThan(sleepTime * 0.95);
      expect(elapsed).toBeLessThan(sleepTime * 1.05);
    });
  });

  describe('resolveLimited', () => {
    it('should restrict resolution if over limit', async () => {
      const start = Date.now();

      await promiseService.resolveLimited({
        data: [ 100, 200, 300, 400 ],
        promise: (t) => promiseService.sleep(t),
        limit: 1,
      });

      const elapsed = Date.now() - start;
      expect(elapsed).toBeGreaterThan(900);
    });

    it('should resolve in parallel if within limit', async () => {
      const start = Date.now();

      await promiseService.resolveLimited({
        data: [ 100, 200, 300, 400 ],
        promise: (t) => promiseService.sleep(t),
        limit: 4,
      });

      const elapsed = Date.now() - start;
      expect(elapsed).toBeLessThan(500);
    });

    it('should throw error if any resolution fails', async () => {
      const errorMessage = 'RESOLVE_LIMITED_FAILED';
      let counter = 0;
      let err: Error;

      const promise = (): Promise<void> => new Promise((r) => {
        counter++;
        if (counter > 50) throw new Error(errorMessage);
        r();
      });

      try {
        await promiseService.resolveLimited({
          data: [ ...Array.from({ length: 100 }).keys() ],
          promise,
          limit: 10,
        });
      }
      catch (e) {
        err = e;
      }

      expect(err.message).toBe(errorMessage);
    });
  });

  describe('resolveDeduplicated', () => {
    it('should not duplicate underlying promise execution', async () => {
      let counter = 0;

      const fn = async (): Promise<number> => {
        counter++;
        await setTimeout(2000);
        return Math.random();
      };

      const dedup = (): Promise<number> => promiseService.resolveDeduplicated({
        key: 'dedup',
        timeout: 5000,
        promise: fn,
      });

      const firstPromise = dedup();
      const secondPromise = dedup();
      const thirdPromise = dedup();

      const [ first, second, third ] = await Promise.all([ firstPromise, secondPromise, thirdPromise ]);

      expect(counter).toBe(1);
      expect(second).toEqual(first);
      expect(third).toEqual(first);
    });
  });

  describe('retryOnException', () => {
    it('should retry a method for 5 times', async () => {
      const counter = { quantity: 0 };
      const retries = 5;

      try {
        await promiseService.retryOnRejection({
          promise: () => mockFailure(counter),
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
        await promiseService.retryOnRejection({
          promise: () => mockFailure(counter),
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
        await promiseService.retryOnRejection({
          promise: () => promiseService.sleep(2000),
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
        await promiseService.retryOnRejection({
          promise: () => mockFailure(counter),
          retries,
        });
      }
      catch { /* Handled by expect */ }

      expect(counter.quantity).toBe(1);
    });
  });
});

