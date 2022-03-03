/* eslint-disable unicorn/no-process-exit */
import { ClassConstructor, plainToClass } from 'class-transformer';
import { validateSync, ValidationError } from 'class-validator';
import dotenv from 'dotenv';

import { ConfigModuleOptions, ConfigSecretRecord } from './config.interface';

/**
 * Fully static service to manage environment
 * population, validation and cache creation.
 */
export class ConfigService {

  private static readonly SECRET_CACHE: ConfigSecretRecord[] = [ ];
  private static readonly CONFIG_DEFINITIONS: any[] = [ ];

  /**
   * Store provided class with config definition into the classes array.
   * @param config
   */
  public static loadConfigDefinition(config: any): void {
    this.CONFIG_DEFINITIONS.push(config);
  }

  /**
   * Orchestrates initial secret acquisition and storage.
   * This procedure should be called only once at the registration
   * of config module in your application.
   * @param options
   */
  public static setupSecretEnvironment(options: ConfigModuleOptions = { }): ValidationError[] {
    const { allowValidationErrors } = options;

    this.loadInitialEnvironment(options);
    this.populateSecretCache();

    const errors = this.validateConfigs();

    // If config validation failure is not allowed, print errors and quit application
    if (errors.length > 0 && !allowValidationErrors) {
      const timestamp = new Date().toISOString();
      const strTimestamp = timestamp.replace('T', ' ').replace('Z', '');
      const errorConstraints = errors.map(({ property, constraints }) => ({ property, constraints }));

      const errorMessage = `${strTimestamp} | FATAL   | config.service       | Environment validation failed`
        + `\n${JSON.stringify({ errors: errorConstraints }, null, 2)}`;

      // eslint-disable-next-line no-console
      console.error(errorMessage);
      process.exit(1);
    }

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

    const { value, fallback, json } = secret;

    if (value && json && typeof value === 'string') {
      try {
        secret.value = JSON.parse(value);
      }
      catch {
        secret.value = 'invalid json string';
      }
    }

    if (!value && fallback && typeof fallback === 'function') {
      const environment = this.getSecret('NODE_ENV');
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      secret.fallback = secret.fallback(environment);
    }

    return value ?? fallback;
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
    const { envPath: path } = options;

    const envFile = dotenv.config({ path }).parsed || { };
    process.env = { ...process.env, ...envFile };

    for (const configDefinition of this.CONFIG_DEFINITIONS) {
      new configDefinition();
    }
  }

  /**
   * For each property injected with secret decorator,
   * populate their values from runtime environment.
   */
  private static populateSecretCache(): void {
    for (const secret of this.SECRET_CACHE) {
      const processValue = process.env[secret.key] ?? process.env[secret.key.toUpperCase()];

      if (processValue !== undefined && processValue !== null) {
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
   */
  private static validateConfigs(): ValidationError[] {
    const validationErrors: ValidationError[] = [ ];
    const secretEnv: Record<string, any> = { };

    for (const record of this.SECRET_CACHE) {
      secretEnv[record.key] = record.value || record.fallback;
    }

    for (const configDefinition of this.CONFIG_DEFINITIONS) {
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
    return uniqueErrors;
  }

}
