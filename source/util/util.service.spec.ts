import { TestingModuleBuilder } from '@nestjs/testing';

import { TestModule } from '../test';
import { UtilModule } from './util.module';
import { UtilService } from './util.service';

const mockFailure = (c): void => {
  c.quantity++;
  throw new Error('error');
};

TestModule.createSandbox({
  name: 'UtilService',
  imports: [ UtilModule ],

  descriptor: (testingBuilder: TestingModuleBuilder) => {
    let utilService: UtilService;

    beforeAll(async () => {
      const testingModule = await testingBuilder.compile();
      utilService = testingModule.get(UtilService);
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

    describe('getClientIp', () => {
      it('should extract a client ip', () => {
        const mockReq = { headers: { 'x-client-ip': '123.45.67.8' } };
        const clientIp = utilService.getClientIp(mockReq as any);
        expect(clientIp).toBe('123.45.67.8');
      });

      it('should extract a forwarded client ip', () => {
        const mockFwd = 'by=3.235.33.140;for=123.45.67.8;host=google.com;proto=https,for="3.235.33.140";proto=https';
        const mockReq = { headers: { forwarded: mockFwd } };
        const clientIp = utilService.getClientIp(mockReq as any);
        expect(clientIp).toBe('123.45.67.8');
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
  },

});
