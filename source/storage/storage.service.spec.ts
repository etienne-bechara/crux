import { AppModule } from '../app/app.module';
import { StorageModule } from './storage.module';
import { StorageService } from './storage.service';

interface StorageTestKey {
  testString: string;
  testNumber: number;
  testObject: Record<string, any>;
  testArray: unknown[];
  testTtl: string;
}

describe('StorageService', () => {
  let storageService: StorageService<StorageTestKey>;
  const testString = 'hello world';
  const testNumber = 1_234_567_890;
  const testObject = { hello: 'world', numbers: [ 1, 2, 3 ] };
  const testArray = [ 'hello', 'world', 1, 2, 3, testObject ];
  const testTtl = testString;
  const ttl = 1000;

  beforeAll(async () => {
    const app = await AppModule.compile({
      disableModuleScan: true,
      disableLogger: true,
      imports: [ StorageModule ],
    });

    storageService = app.get(StorageService);
  });

  describe('setKey', () => {
    it('should successfully set storage keys', () => {
      storageService.setKey('testString', testString);
      storageService.setKey('testNumber', testNumber);
      storageService.setKey('testObject', testObject);
      storageService.setKey('testArray', testArray);
      expect(true).toBeTruthy();
    });

    it('should successfully set storage key with TTL', () => {
      storageService.setKey('testTtl', testTtl, { ttl });
      expect(true).toBeTruthy();
    });
  });

  describe('getKey', () => {
    it('should successfully read storage keys', () => {
      expect(storageService.getKey('testString')).toBe(testString);
      expect(storageService.getKey('testNumber')).toBe(testNumber);
      expect(storageService.getKey('testObject')).toBe(testObject);
      expect(storageService.getKey('testArray')).toBe(testArray);
    });

    it('should read undefined for storage keys with expired TTL', async () => {
      expect(storageService.getKey('testTtl')).toBe(testTtl);
      await new Promise((r) => setTimeout(r, ttl * 1.05));
      expect(storageService.getKey('testTtl')).toBe(undefined);
    });
  });

  describe('delKey', () => {
    it('should successfully erase storage keys', () => {
      storageService.delKey('testString');
      storageService.delKey('testNumber');
      storageService.delKey('testObject');
      storageService.delKey('testArray');
      expect(storageService.getKey('testString')).toBe(undefined);
      expect(storageService.getKey('testNumber')).toBe(undefined);
      expect(storageService.getKey('testObject')).toBe(undefined);
      expect(storageService.getKey('testArray')).toBe(undefined);
    });
  });
});
