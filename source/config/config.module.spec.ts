/* eslint-disable @typescript-eslint/no-unused-vars */
import { IsIn, IsNumber, IsObject } from 'class-validator';

import { AppEnvironment } from '../app/app.enum';
import { ToNumber } from '../transform/transform.decorator';
import { Config, InjectConfig } from './config.decorator';
import { ConfigModule } from './config.module';

@Config()
class TestConfig {

  @InjectConfig()
  @IsIn(Object.values(AppEnvironment))
  public readonly NODE_ENV: AppEnvironment;

  @InjectConfig({ fallback: 'config_fallback' })
  public readonly TEST_CONFIG_FALLBACK: string;

  @InjectConfig({ fallback: '100' })
  @ToNumber()
  public readonly TEST_CONFIG_TRANSFORM: number;

  @InjectConfig({ json: true, fallback: '{"hello":"world"}' })
  @IsObject()
  public readonly TEST_CONFIG_JSON: number;

  @InjectConfig({ fallback: '100' })
  @IsNumber()
  public readonly TEST_CONFIG_VALIDATION: number;

}

describe('ConfigModule', () => {
  beforeAll(() => {
    ConfigModule.register({ allowValidationErrors: true });
  });

  describe('getConfig', () => {
    it('should read an injected config', () => {
      const configValue = ConfigModule.get('NODE_ENV');
      expect(configValue).toBeDefined();
    });

    it('should return config fallback', () => {
      const configValue = ConfigModule.get('TEST_CONFIG_FALLBACK');
      expect(configValue).toBe('config_fallback');
    });

    it('should transform config type', () => {
      const configValue = ConfigModule.get('TEST_CONFIG_TRANSFORM');
      expect(configValue).toBe(100);
    });

    it('should parse json config', () => {
      const configValue = ConfigModule.get('TEST_CONFIG_JSON');
      expect(configValue).toStrictEqual({ hello: 'world' });
    });
  });

  describe('validateConfigs', () => {
    it('should flag a configuration error', () => {
      const validationErrors = ConfigModule['validateConfigs']({ allowValidationErrors: true });
      expect(validationErrors.length).toBeGreaterThanOrEqual(1);
      expect(validationErrors[0].property).toBe('TEST_CONFIG_VALIDATION');
    });
  });
});
