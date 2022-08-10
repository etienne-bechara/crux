import { applyDecorators, Injectable } from '@nestjs/common';

import { ConfigMetadata } from './config.enum';
import { ConfigInjectionOptions } from './config.interface';
import { ConfigModule } from './config.module';

/**
 * Loads decorated class as a config.
 */
export function Config(): any {
  // eslint-disable-next-line unicorn/consistent-function-scoping
  const loadTargetAsConfig = (target: unknown): void => {
    ConfigModule.setClass(target);
  };

  return applyDecorators(
    Injectable(),
    loadTargetAsConfig,
  );
}

/**
 * Change the get behaviour of decorated property to return
 * the desired key from secret cache.
 *
 * If not yet available, provide a pseudo path that should
 * be interpreted by secret service when building its path.
 * @param options
 */
export function InjectConfig(options: ConfigInjectionOptions = { }): any {
  const { key: baseKey, json, fallback } = options;

  return function (target: unknown, propertyKey: string): void {
    const key = baseKey || propertyKey;
    Reflect.defineMetadata(ConfigMetadata.CONFIG_KEY, key, target, propertyKey);
    ConfigModule.set({ key, fallback, json });

    Object.defineProperty(target, propertyKey, {
      get: () => ConfigModule.get(key),
      set: (value) => { ConfigModule.set({ key, value }); },
    });
  };
}
