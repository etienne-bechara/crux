import { AppModule } from '../app/app.module';
import { MemoryService } from './memory.service';

interface MemoryTestKey {
  testString: string;
  testNumber: number;
  testObject: Record<string, any>;
  testArray: unknown[];
  testTtl: string;
}

describe('MemoryService', () => {
  let memoryService: MemoryService<MemoryTestKey>;
  const testString = 'hello world';
  const testNumber = 1_234_567_890;
  const testObject = { hello: 'world', numbers: [ 1, 2, 3 ] };
  const testArray = [ 'hello', 'world', 1, 2, 3, testObject ];
  const testTtl = testString;
  const ttl = 2000;

  beforeAll(async () => {
    const app = await AppModule.compile({ disableAll: true });
    memoryService = app.get(MemoryService);
  });

  describe('setKey', () => {
    it('should successfully set storage keys', () => {
      memoryService.setKey('testString', testString);
      memoryService.setKey('testNumber', testNumber);
      memoryService.setKey('testObject', testObject);
      memoryService.setKey('testArray', testArray);
      expect(true).toBeTruthy();
    });

    it('should successfully set storage key with TTL', () => {
      memoryService.setKey('testTtl', testTtl, { ttl });
      expect(true).toBeTruthy();
    });

    it('should not overwrite existing key TTL', async () => {
      const delay = 1500;
      await new Promise((r) => setTimeout(r, delay));

      memoryService.setKey('testTtl', testTtl, { ttl });
      const exp = memoryService['memoryExpiration'].get('testTtl');

      expect(exp - Date.now()).toBeLessThanOrEqual(ttl - delay);
    });
  });

  describe('getKey', () => {
    it('should successfully read storage keys', () => {
      expect(memoryService.getKey('testString')).toBe(testString);
      expect(memoryService.getKey('testNumber')).toBe(testNumber);
      expect(memoryService.getKey('testObject')).toBe(testObject);
      expect(memoryService.getKey('testArray')).toBe(testArray);
    });

    it('should read undefined for storage keys with expired TTL', async () => {
      expect(memoryService.getKey('testTtl')).toBe(testTtl);
      await new Promise((r) => setTimeout(r, ttl * 1.05));
      expect(memoryService.getKey('testTtl')).toBe(undefined);
    });
  });

  describe('delKey', () => {
    it('should successfully erase storage keys', () => {
      memoryService.delKey('testString');
      memoryService.delKey('testNumber');
      memoryService.delKey('testObject');
      memoryService.delKey('testArray');
      expect(memoryService.getKey('testString')).toBe(undefined);
      expect(memoryService.getKey('testNumber')).toBe(undefined);
      expect(memoryService.getKey('testObject')).toBe(undefined);
      expect(memoryService.getKey('testArray')).toBe(undefined);
    });
  });
});
