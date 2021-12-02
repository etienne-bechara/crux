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

  describe('getServerIp', () => {
    it('should acquire public ip successfully', async () => {
      const serverIp = await utilService.getServerIp();
      expect(serverIp).toBeDefined();
    });
  });

  describe('getAppStatus', () => {
    it('should read application cpu, memory and network', async () => {
      const appStatus = await utilService.getAppStatus();
      expect(appStatus.system.uptime).toBeGreaterThan(0);
      expect(appStatus.memory.total).toBeGreaterThan(0);
      expect(appStatus.cpus.length).toBeGreaterThan(0);
    });
  });

  describe('encrypt', () => {
    it('should encrypt target value always resulting in different outputs', () => {
      const key = 'P6y4ANW#b@5X*MkpQfzH8vLrKcT9u^hD';
      const scenario = 'rDbLWk7Q6@FJPcCR9T5w^BNXt!&ezEjg';
      const hash01 = utilService.encrypt(scenario, key);
      const hash02 = utilService.encrypt(scenario, key);

      expect(hash01 !== hash02).toBeTruthy();
    });
  });

  describe('encryptWithoutIv', () => {
    it('should encrypt target value always resulting in same output', () => {
      const key = 'P6y4ANW#b@5X*MkpQfzH8vLrKcT9u^hD';
      const scenario01 = 'abcdefghijklmnopqrstuvwyz';
      const scenario02 = '0123456789';
      const scenario03 = 'rDbLWk7Q6@FJPcCR9T5w^BNXt!&ezEjg';
      const hash01 = '8d4b050c4994554293944ca53cd44f485e9b4a536fec3a1283';
      const hash02 = 'dc18545b18c7041dc2c7';
      const hash03 = '9e6d04247b99057bccbe618301d9636a16bd0c5044d803338d101e149e0f4fa8';

      expect(utilService.encryptWithoutIv(scenario01, key)).toBe(hash01);
      expect(utilService.encryptWithoutIv(scenario02, key)).toBe(hash02);
      expect(utilService.encryptWithoutIv(scenario03, key)).toBe(hash03);
    });
  });

  describe('decrypt', () => {
    it('should encrypt target input and decrypt to same value', () => {
      const key = 'P6y4ANW#b@5X*MkpQfzH8vLrKcT9u^hD';
      const scenario01 = 'abcdefghijklmnopqrstuvwyz';
      const scenario02 = '0123456789';
      const scenario03 = 'rDbLWk7Q6@FJPcCR9T5w^BNXt!&ezEjg';

      expect(utilService.decrypt(null, key)).toBe(null);
      expect(utilService.decrypt(utilService.encrypt(scenario01, key), key)).toBe(scenario01);
      expect(utilService.decrypt(utilService.encryptWithoutIv(scenario02, key), key)).toBe(scenario02);
      expect(utilService.decrypt(utilService.encrypt(scenario03, key), key)).toBe(scenario03);
    });
  });
});

