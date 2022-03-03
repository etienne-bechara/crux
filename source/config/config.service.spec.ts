/* eslint-disable @typescript-eslint/no-unused-vars */
import { Transform } from 'class-transformer';
import { IsIn, IsNumber, ValidationError } from 'class-validator';

import { AppEnvironment } from '../app/app.enum';
import { Config, InjectSecret } from './config.decorator';
import { ConfigService } from './config.service';

@Config()
class TestMockConfig {

  @InjectSecret()
  @IsIn(Object.values(AppEnvironment))
  public readonly NODE_ENV: AppEnvironment;

  @InjectSecret({ key: 'secret_unit_test_key' })
  public readonly TEST_SECRET_INJECTION: string;

  @InjectSecret({ fallback: 'secret_default' })
  public readonly TEST_SECRET_FALLBACK: string;

  @InjectSecret({ fallback: '100' })
  @IsNumber()
  public readonly TEST_SECRET_VALIDATION: number;

  @InjectSecret({ fallback: '100' })
  @Transform((o) => Number(o.value))
  public readonly TEST_SECRET_TRANSFORM: number;

}

describe('ConfigService', () => {
  let validationErrors: ValidationError[];

  beforeAll(() => {
    validationErrors = ConfigService.setupSecretEnvironment({
      allowValidationErrors: true,
    });
  });

  describe('setupSecretEnvironment', () => {
    it('should populate the secret cache', () => {
      expect(validationErrors).toBeDefined();
    });
  });

  describe('getSecret', () => {
    it('should read an injected secret', () => {
      const secretValue = ConfigService.getSecret('NODE_ENV');
      expect(secretValue).toBeDefined();
    });

    it('should return secret default if value is null', () => {
      const secretValue = ConfigService.getSecret('TEST_SECRET_FALLBACK');
      expect(secretValue).toBe('secret_default');
    });

    it('should transform secret type', () => {
      const secretValue = ConfigService.getSecret('TEST_SECRET_TRANSFORM');
      expect(secretValue).toBe(100);
    });
  });

  describe('validateConfigs', () => {
    it('should flag a configuration error', () => {
      expect(validationErrors.length).toBeGreaterThanOrEqual(1);
      expect(validationErrors[0].property).toBe('TEST_SECRET_VALIDATION');
    });
  });
});
