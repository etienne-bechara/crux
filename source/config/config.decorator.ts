/* eslint-disable @typescript-eslint/naming-convention */
import { ConfigMetadataKey } from './config.enum';
import { ConfigInjectionOptions } from './config.interface';
import { ConfigService } from './config.service';

/**
 * Change the get behaviour of decorated property to return
 * the desired key from secret cache.
 *
 * If not yet available, provide a pseudo path that should
 * be interpreted by secret service when building its path.
 * @param options
 */
export function InjectSecret(options: ConfigInjectionOptions = { }): any {
  return function (target: any, propertyKey: string): void {
    const secretKey = options.key || propertyKey;
    Reflect.defineMetadata(ConfigMetadataKey.SECRET_KEY, secretKey, target, propertyKey);

    ConfigService.setSecret({
      key: secretKey,
      value: null,
      default: options.default,
      json: options.json,
    });

    Object.defineProperty(target, propertyKey, {
      get: () => ConfigService.getSecret(secretKey),
      set: (value) => {
        ConfigService.setSecret({
          key: secretKey,
          value,
          default: options.default,
        });
      },
    });
  };
}
