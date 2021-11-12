/* eslint-disable unicorn/no-process-exit */
/* eslint-disable no-console */
import { ClassConstructor, plainToClass } from 'class-transformer';
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
  public static setupSecretEnvironment(options: ConfigModuleOptions = { }): ValidationError[] {
    options.configs ??= [ ];
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

    const { value, baseValue, jsonParse } = secret;

    if (value && jsonParse && typeof value === 'string') {
      try {
        secret.value = JSON.parse(value);
      }
      catch {
        secret.value = 'invalid json string';
      }
    }

    if (!value && baseValue && typeof baseValue === 'function') {
      const nodeEnv = this.getSecret('NODE_ENV');
      secret.baseValue = secret.baseValue(nodeEnv);
    }

    return value ?? baseValue;
  }

  /**
   * Sets a secret, uses upsert methodology.
   * @param secret
   */
  public static setSecret(secret: ConfigSecretRecord = { }): void {
    const { key, value } = secret;
    if (!key) return;

    const secretIndex = this.SECRET_CACHE.findIndex((record) => {
      return record.key.toUpperCase() === key.toUpperCase();
    });

    if (secretIndex >= 0) {
      const currentSecret = this.SECRET_CACHE[secretIndex];
      currentSecret.value = value;
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
    const { configs, envPath: path } = options;

    const envFile = dotenv.config({ path }).parsed || { };
    process.env = { ...process.env, ...envFile };

    for (const configDefinition of configs) {
      new configDefinition();
    }
  }

  /**
   * For each property injected with secret decorator,
   * populate their values from runtime environment.
   */
  private static populateSecretCache(): void {
    for (const secret of this.SECRET_CACHE) {
      const processValue = process.env[secret.key] || process.env[secret.key.toUpperCase()];

      if (processValue) {
        this.setSecret({
          key: secret.key,
          value: processValue,
        });
      }
    }
  }

  /**
   * Validates provided config classes against current secret cache
   * using rules from class-validator and class-transformer.
   * @param options
   */
  private static validateConfigs(options: ConfigModuleOptions = { }): ValidationError[] {
    const { allowValidationErrors, configs } = options;
    const validationErrors: ValidationError[] = [ ];
    const secretEnv: Record<string, any> = { };

    for (const record of this.SECRET_CACHE) {
      secretEnv[record.key] = record.value || record.baseValue;
    }

    for (const configDefinition of configs) {
      const configConstructor: ClassConstructor<ValidationError[]> = configDefinition;
      const validationInstance: ValidationError[] = plainToClass(configConstructor, secretEnv);

      const partialErrors = validateSync(validationInstance, {
        validationError: { target: false },
      });

      if (partialErrors && partialErrors.length > 0) {
        validationErrors.push(...partialErrors);
      }
    }

    const uniqueErrors = validationErrors.filter((v, i, a) => a.findIndex(t => t.property === v.property) === i);

    // On validation failure, exit in 100ms in order for errors to print
    if (uniqueErrors.length > 0 && !allowValidationErrors) {
      console.error(...uniqueErrors);
      setTimeout(() => process.exit(1), 100);
    }

    return uniqueErrors;
  }

}
