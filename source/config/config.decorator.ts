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
  const { key: baseKey, jsonParse, baseValue } = options;

  return function (target: any, propertyKey: string): void {
    const key = baseKey || propertyKey;
    Reflect.defineMetadata(ConfigMetadataKey.SECRET_KEY, key, target, propertyKey);
    ConfigService.setSecret({ key, baseValue, jsonParse });

    Object.defineProperty(target, propertyKey, {
      get: () => ConfigService.getSecret(key),
      set: (value) => {
        ConfigService.setSecret({ key, value, baseValue });
      },
    });
  };
}
