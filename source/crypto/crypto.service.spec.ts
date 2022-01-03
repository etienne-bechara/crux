import { AppModule } from '../app/app.module';
import { CryptoService } from './crypto.service';

describe('CryptoService', () => {
  let cryptoService: CryptoService;

  beforeAll(async () => {
    const app = await AppModule.compile({ disableLogger: true });
    cryptoService = app.get(CryptoService);
  });

  describe('encrypt', () => {
    it('should encrypt target value always resulting in different outputs', () => {
      const key = 'P6y4ANW#b@5X*MkpQfzH8vLrKcT9u^hD';
      const scenario = 'rDbLWk7Q6@FJPcCR9T5w^BNXt!&ezEjg';
      const hash01 = cryptoService.encrypt(scenario, key);
      const hash02 = cryptoService.encrypt(scenario, key);

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

      expect(cryptoService.encryptWithoutIv(scenario01, key)).toBe(hash01);
      expect(cryptoService.encryptWithoutIv(scenario02, key)).toBe(hash02);
      expect(cryptoService.encryptWithoutIv(scenario03, key)).toBe(hash03);
    });
  });

  describe('decrypt', () => {
    it('should encrypt target input and decrypt to same value', () => {
      const key = 'P6y4ANW#b@5X*MkpQfzH8vLrKcT9u^hD';
      const scenario01 = 'abcdefghijklmnopqrstuvwyz';
      const scenario02 = '0123456789';
      const scenario03 = 'rDbLWk7Q6@FJPcCR9T5w^BNXt!&ezEjg';

      expect(cryptoService.decrypt(null, key)).toBe(null);
      expect(cryptoService.decrypt(cryptoService.encrypt(scenario01, key), key)).toBe(scenario01);
      expect(cryptoService.decrypt(cryptoService.encryptWithoutIv(scenario02, key), key)).toBe(scenario02);
      expect(cryptoService.decrypt(cryptoService.encrypt(scenario03, key), key)).toBe(scenario03);
    });
  });
});

