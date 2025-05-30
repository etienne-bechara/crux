import fs from 'node:fs';
import { DynamicModule, Module, ValidationError } from '@nestjs/common';
import { ClassConstructor, plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import dotenv from 'dotenv';

import { AppEnvironment } from '../app/app.enum';
import { LogSeverity } from '../log/log.enum';
import { LogParams } from '../log/log.interface';
import { ConfigModuleOptions, ConfigRecord } from './config.interface';

@Module({})
export class ConfigModule {
	private static configs: ConfigRecord[] = [];
	private static classes: ClassConstructor<any>[] = [];
	private static isRegistered: boolean;

	/**
	 * During registration scan for environment file and instantiate
	 * each config class to apply @InjectConfig() decorators.
	 * @param options
	 */
	public static async registerAsync(options: ConfigModuleOptions = {}): Promise<DynamicModule> {
		ConfigModule.isRegistered = true;

		for (const configClass of ConfigModule.classes) {
			new configClass();
		}

		ConfigModule.setBaseValues(options);
		await ConfigModule.validateConfigs(options);

		return { module: ConfigModule };
	}

	/**
	 * Returns an object corresponding to merged process with environment file.
	 * @param options
	 */
	private static getMergedEnv(options: ConfigModuleOptions = {}): Record<string, any> {
		const { envPath } = options;
		const path = envPath || ConfigModule.scanEnvFile();
		const envFile = dotenv.config({ path }).parsed || {};

		return { ...process.env, ...envFile };
	}

	/**
	 * Given current working directory, attempt to find
	 * an .env file up to the desired maximum depth.
	 * @param maxDepth
	 */
	private static scanEnvFile(maxDepth = 5): string | undefined {
		let testPath = process.cwd();
		let testFile = `${testPath}/.env`;

		for (let i = 0; i < maxDepth; i++) {
			const pathExist = fs.existsSync(testPath);
			const fileExist = fs.existsSync(testFile);

			if (!pathExist) break;
			if (fileExist) return testFile;

			testPath = `${testPath}/..`;
			testFile = testFile.replaceAll(/\.env$/g, '../.env');
		}
	}

	/**
	 * For each application config, set its default value based
	 * on process environment or configured fallback.
	 * @param options
	 */
	private static setBaseValues(options: ConfigModuleOptions): void {
		const env = ConfigModule.getMergedEnv(options);

		for (const config of ConfigModule.configs) {
			const { key, fallback, json, value: baseValue } = config;
			let value: any = env[key] ?? env[key.toUpperCase()] ?? baseValue;

			if ((value === undefined || value === null) && fallback) {
				value = typeof fallback === 'function' ? fallback(env.NODE_ENV as AppEnvironment) : fallback;
			}

			if (value && json && typeof value === 'string') {
				try {
					value = JSON.parse(value);
				} catch {
					value = 'invalid json string';
				}
			}

			ConfigModule.set({ key, value });
		}
	}

	/**
	 * Validate properties annotated with @InjectConfig().
	 * @param options
	 */
	private static async validateConfigs(options: ConfigModuleOptions): Promise<ValidationError[]> {
		const { allowValidationErrors } = options;
		const errors: ValidationError[] = [];
		const configObj: Record<string, any> = {};

		for (const config of ConfigModule.configs) {
			const { key, value } = config;
			configObj[key] = value;
		}

		for (const configClass of ConfigModule.classes) {
			const configInstance = plainToClass(configClass as ClassConstructor<unknown>, configObj);

			const validationErrors = await validate(configInstance as object, {
				forbidUnknownValues: false,
				validationError: { target: false },
			});

			if (validationErrors && validationErrors.length > 0) {
				errors.push(...validationErrors);
			}
		}

		if (errors.length > 0 && !allowValidationErrors) {
			const validationErrors = errors.map(({ property, constraints }) => ({ property, constraints }));

			const logMessage: Partial<LogParams> = {
				timestamp: new Date().toISOString(),
				severity: LogSeverity.FATAL,
				message: 'Environment validation failed',
				caller: 'config.module',
				data: { constraints: validationErrors },
			};

			console.error(JSON.stringify(logMessage, null, 2));
			process.exit(1);
		}

		return errors;
	}

	/**
	 * Store provided class with config definition into the classes array.
	 * @param config
	 */
	public static setClass(config: any): void {
		ConfigModule.classes.push(config);
	}

	/**
	 * Read target config by key.
	 * @param key
	 */
	public static get(key: string): any {
		if (!ConfigModule.isRegistered) {
			const env = ConfigModule.getMergedEnv();
			return env[key];
		}

		const config = ConfigModule.configs.find((c) => c.key === key.toUpperCase());
		return config?.value;
	}

	/**
	 * Creates an application config, or replace value of existing.
	 * @param config
	 */
	public static set(config: ConfigRecord): void {
		config.key = config.key.toUpperCase();

		const { key, value } = config;
		const index = ConfigModule.configs.findIndex((c) => c.key === key);

		if (index >= 0) {
			ConfigModule.configs[index].value = value;
		} else {
			ConfigModule.configs.push(config);
		}
	}
}
