import { Injectable, applyDecorators } from '@nestjs/common';

import { ConfigMetadata } from './config.enum';
import { ConfigInjectionOptions } from './config.interface';
import { ConfigModule } from './config.module';

/**
 * Loads decorated class as a config.
 */
export function Config(): ClassDecorator {
	const loadTargetAsConfig = (target: unknown): void => {
		ConfigModule.setClass(target);
	};

	return applyDecorators(Injectable(), loadTargetAsConfig);
}

/**
 * Change the get behaviour of decorated property to return
 * the desired key from secret cache.
 *
 * If not yet available, provide a pseudo path that should
 * be interpreted by secret service when building its path.
 * @param options
 */
export function InjectConfig(options: Partial<ConfigInjectionOptions> = {}): PropertyDecorator {
	const { key: baseKey, json, fallback } = options;

	return (target: any, propertyKey: string | symbol): void => {
		const key = baseKey || (propertyKey as string);
		Reflect.defineMetadata(ConfigMetadata.CONFIG_KEY, key, target, propertyKey);
		ConfigModule.set({ key, fallback, json });

		Object.defineProperty(target, propertyKey, {
			get: () => ConfigModule.get(key),
			set: (value) => {
				ConfigModule.set({ key, value });
			},
		});
	};
}
