import { IsIn, IsNumber, ValidationError } from 'class-validator';

import { AppEnvironment } from '../app/app.enum';
import { TestModule } from '../test';
import { InjectSecret } from './config.decorator';
import { ConfigService } from './config.service';

class TestMockConfig {

  @InjectSecret()
  @IsIn(Object.values(AppEnvironment))
  public readonly NODE_ENV: AppEnvironment;

  @InjectSecret({ key: 'secret_unit_test_key' })
  public readonly TEST_SECRET_INJECTION: string;

  @InjectSecret({ default: 'secret_default' })
  public readonly TEST_SECRET_FALLBACK: string;

  @IsNumber()
  public readonly TEST_SECRET_VALIDATION = 'one';

}

TestModule.createSandbox({
  name: 'ConfigService',

  descriptor: () => {
    let validationErrors: ValidationError[];

    beforeAll(async () => {
      validationErrors = await ConfigService.setupSecretEnvironment({
        configs: [ TestMockConfig ],
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
    });

    describe('setSecret', () => {
      it('should disallow setting a secret after initialization', () => {
        let setError: boolean;

        try {
          ConfigService.setSecret({ key: 'SECRET_NUMBER', value: 1 });
        }
        catch {
          setError = true;
        }

        expect(setError).toBeTruthy();
      });
    });

    describe('validateConfigs', () => {
      it('should flag a configuration error', () => {
        expect(validationErrors.length).toBeGreaterThanOrEqual(1);
        expect(validationErrors[0].property).toBe('TEST_SECRET_VALIDATION');
      });
    });
  },
});
