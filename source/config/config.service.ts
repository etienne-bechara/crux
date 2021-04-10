/* eslint-disable @typescript-eslint/naming-convention */
import { plainToClass } from 'class-transformer';
import { validateSync, ValidationError } from 'class-validator';
import dotenv from 'dotenv';

import { ConfigSecretRecord } from './config.interface';
import { ConfigModuleOptions } from './config.interface/config.module.options';

/**
 * Fully static service to manage environment
 * population, validation and cache creation.
 */
export class ConfigService {

  private static readonly SECRET_CACHE: ConfigSecretRecord[] = [ ];

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
    return errors;
  }

  /**
   * Returns a secret value, key is case insensitive.
   * @param key
   */
  public static getSecret(key: string): any {
    if (!key) return;

    const secret = this.SECRET_CACHE.find((s) => s.key.toUpperCase() === key.toUpperCase());
    if (!secret) return;

    if (secret.value && secret.json && typeof secret.value === 'string') {
      try {
        secret.value = JSON.parse(secret.value);
      }
      catch {
        secret.value = 'invalid json string';
      }
    }

    if (!secret.value && secret.default && typeof secret.default === 'function') {
      const nodeEnv = this.getSecret('NODE_ENV');
      secret.default = secret.default(nodeEnv);
    }

    return secret.value ?? secret.default;
  }

  /**
   * Sets a secret, uses upsert methodology.
   * @param secret
   */
  public static setSecret(secret: ConfigSecretRecord = { }): void {
    if (!secret.key) return;

    const secretIndex = this.SECRET_CACHE.findIndex((record) => {
      return record.key.toUpperCase() === secret.key.toUpperCase();
    });

    if (secretIndex >= 0) {
      const currentSecret = this.SECRET_CACHE[secretIndex];
      currentSecret.value = secret.value;
    }
    else {
      this.SECRET_CACHE.push(secret);
    }
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
    const envFile = dotenv.config({ path: options.envPath }).parsed || { };
    process.env = { ...process.env, ...envFile };

    for (const ConfigClass of options.configs) {
      new ConfigClass();
    }
  }

  /**
   * For each property injected with secret decorator,
   * populate their values from runtime environment.
   */
  private static populateSecretCache(): void {
    this.SECRET_CACHE.forEach((secret) => {
      const processValue = process.env[secret.key] || process.env[secret.key.toUpperCase()];

      if (processValue) {
        this.setSecret({
          key: secret.key,
          value: processValue,
        });
      }
    });
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
      const validationInstance: ValidationError[] = plainToClass(ConfigClass, secretEnv);
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
