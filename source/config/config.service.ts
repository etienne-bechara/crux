/* eslint-disable @typescript-eslint/naming-convention */
import { plainToClass } from 'class-transformer';
import { validateSync, ValidationError } from 'class-validator';
import dotenv from 'dotenv';

import { AppEnvironment } from '../app/app.enum';
import { ConfigSecretRecord } from './config.interface';
import { ConfigModuleOptions } from './config.interface/config.module.options';

/**
 * Fully static service to manage environment
 * population, validation and cache creation.
 */
export class ConfigService {

  private static readonly SECRET_CACHE: ConfigSecretRecord[] = [ ];
  private static secretCacheFreeze: boolean;

  /**
   * Returns a secret value, key is case insensitive.
   * @param key
   */
  public static getSecret(key: string): any {
    if (!key) return;
    const secret = this.SECRET_CACHE.find((record) => {
      return record.key.toUpperCase() === key.toUpperCase();
    });
    return secret?.value || secret?.default;
  }

  /**
   * Sets a secret, uses upsert methodology.
   * @param secret
   */
  public static setSecret(secret: ConfigSecretRecord = { }): void {
    if (!secret.key) return;

    if (this.secretCacheFreeze) {
      throw new Error('cannot update secret cache after it has been initialized');
    }

    const secretIndex = this.SECRET_CACHE.findIndex((record) => {
      return record.key.toUpperCase() === secret.key.toUpperCase();
    });

    if (secretIndex >= 0) {
      const currentSecret = this.SECRET_CACHE[secretIndex];
      currentSecret.value = secret.value;
      currentSecret.default = secret.default || currentSecret.default;
    }
    else {
      this.SECRET_CACHE.push(secret);
    }
  }

  /**
   * Orchestrates initial secret acquisition and storage.
   * This procedure should be called only once at the registration
   * of config module in your application.
   * @param options
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  public static async setupSecretEnvironment(options: ConfigModuleOptions = { }): Promise<ValidationError[]> {
    if (!options.configs) options.configs = [ ];
    this.loadInitialEnvironment(options);
    this.populateSecretCache();
    const errors = this.validateConfigs(options);
    this.secretCacheFreeze = true;
    return errors;
  }

  /**
   * If an env file is provided, merge current process environment
   * with it. In case of collision, give priority to file key.
   *
   * Then, instantiated each of the configuration classes to load
   * the injection routine and populate initial cache.
   * @param options
   */
  private static loadInitialEnvironment(options: ConfigModuleOptions = { }): void {
    const envPath = `${process.cwd()}/${options.envPath || '.env'}`;
    const envFile = dotenv.config({ path: envPath }).parsed || { };
    process.env = { ...process.env, ...envFile };

    for (const ConfigClass of options.configs) {
      new ConfigClass();
    }
  }

  /**
   * Given provided configuration classes, read properties decorated
   * with InjectedSecret and caches their key/value pairs.
   */
  private static populateSecretCache(): void {
    const desiredSecrets = this.SECRET_CACHE.map((record) => record.key);

    desiredSecrets.forEach((secretKey) => {
      let secretValue = null;

      if (process.env[secretKey] || process.env[secretKey.toUpperCase()]) {
        secretValue = process.env[secretKey];
      }

      this.setSecret({ key: secretKey, value: secretValue });
    });
  }

  /**
   * Determines the parent path of secrets, which by default
   * is the environment level.
   */
  private static buildParentPath(): string {
    const envStage = process.env.NODE_ENV as AppEnvironment;

    switch (envStage) {
      case AppEnvironment.PRODUCTION:
        return 'prod';

      case AppEnvironment.STAGING:
        return 'staging';

      case AppEnvironment.DEVELOPMENT:
      case AppEnvironment.LOCAL:
      default:
        return 'dev';
    }
  }

  /**
   * Validates provided config classes against current secret cache
   * using rules from class-validator and class-transformer.
   * @param options
   */
  private static validateConfigs(options: ConfigModuleOptions = { }): ValidationError[] {
    const validationErrors: ValidationError[] = [ ];

    const secretEnv: Record<string, any> = { };
    this.SECRET_CACHE.forEach((record) => secretEnv[record.key] = record.value || record.default);

    for (const ConfigClass of options.configs) {
      const validationInstance = plainToClass(ConfigClass, secretEnv);
      const partialErrors = validateSync(validationInstance, {
        validationError: { target: false },
      });

      if (partialErrors && partialErrors.length > 0) {
        validationErrors.push(...partialErrors);
      }
    }

    const uniqueErrors = validationErrors.filter((v, i, a) => a.findIndex(t => t.property === v.property) === i);

    if (uniqueErrors.length > 0 && !options.allowValidationErrors) {
      console.error(...uniqueErrors); // eslint-disable-line no-console
      process.exit(1); // eslint-disable-line unicorn/no-process-exit
    }
    else if (uniqueErrors.length > 0) {
      console.warn(...uniqueErrors); // eslint-disable-line no-console
    }

    return uniqueErrors;
  }

}
