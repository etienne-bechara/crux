import 'source-map-support/register';
import 'reflect-metadata';

import { DynamicModule, Global, Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE, NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { ROOT_CONTEXT, context, propagation, trace } from '@opentelemetry/api';
import fg from 'fast-glob';

import fastifyMultipart from '@fastify/multipart';
import { CacheDisabledModule, CacheModule } from '../cache/cache.module';
import { ConfigModule } from '../config/config.module';
import { ConsoleModule } from '../console/console.module';
import { ContextStorageKey } from '../context/context.enum';
import { ContextModule } from '../context/context.module';
import { ContextService } from '../context/context.service';
import { ContextStorage } from '../context/context.storage';
import { DocModule } from '../doc/doc.module';
import { LogInterceptor } from '../log/log.interceptor';
import { LogModule } from '../log/log.module';
import { LogService } from '../log/log.service';
import { LokiModule } from '../loki/loki.module';
import { MemoryModule } from '../memory/memory.module';
import { MetricDisabledModule, MetricModule } from '../metric/metric.module';
import { PromiseModule } from '../promise/promise.module';
import { RateInterceptor } from '../rate/rate.interceptor';
import { TimeoutInterceptor } from '../timeout/timeout.interceptor';
import { TraceDisabledModule, TraceModule } from '../trace/trace.module';
import { TraceService } from '../trace/trace.service';
import { ValidateInterceptor } from '../validate/validate.interceptor';
import { ValidatePipe } from '../validate/validate.pipe';
import { APP_DEFAULT_OPTIONS, AppConfig } from './app.config';
import { AppController } from './app.controller';
import { AppEnvironment } from './app.enum';
import { AppFilter } from './app.filter';
import { AppModuleOptions, AppOptions, AppRequest, AppResponse } from './app.interface';
import { AppService } from './app.service';

@Global()
@Module({})
export class AppModule {
	private static instance: NestFastifyApplication;
	private static options: AppOptions;

	/**
	 * Returns application instance.
	 */
	public static getInstance(): NestFastifyApplication {
		if (!AppModule.instance) {
			throw new Error('application instance not configured');
		}

		return AppModule.instance;
	}

	/**
	 * Closes application instance.
	 */
	public static async close(): Promise<void> {
		await AppModule.instance.close();
	}

	/**
	 * Boots an instance of a Nest Application using Fastify, and listen
	 * on desired port and hostname.
	 *
	 * Skips the compile step if a pre-compiled `instance` is provided.
	 * @param options
	 */
	public static async boot(options: AppModuleOptions = {}): Promise<NestFastifyApplication> {
		const { app } = options;

		if (app) {
			AppModule.instance = app;
		} else {
			await AppModule.compile(options);
		}

		await AppModule.listen();
		return AppModule.instance;
	}

	/**
	 * Builds and configures an instance of a Nest Application, returning
	 * its reference without starting the adapter.
	 * @param options
	 */
	public static async compile(options: AppModuleOptions = {}): Promise<NestFastifyApplication> {
		AppModule.configureOptions(options);
		await AppModule.configureAdapter();

		if (!AppModule.options.disableDocs) {
			DocModule.configureDocumentation(AppModule.instance, AppModule.options);
		}

		return AppModule.instance;
	}

	/**
	 * Merge compile options with default and persist them as configuration .
	 * @param options
	 */
	private static configureOptions(options: AppModuleOptions): void {
		const deepMergeProps: (keyof AppOptions)[] = [
			'fastify',
			'validator',
			'cache',
			'http',
			'logs',
			'console',
			'loki',
			'metrics',
			'traces',
			'docs',
		];

		AppModule.options = { ...APP_DEFAULT_OPTIONS, ...options } as AppOptions;

		for (const key of deepMergeProps) {
			const defaultData = APP_DEFAULT_OPTIONS[key] as Record<string, any>;
			const providedData = options[key] as Record<string, any>;

			(AppModule.options[key] as Record<string, any>) = { ...defaultData, ...providedData };
		}

		if (AppModule.options.disableAll) {
			AppModule.options.disableCache = true;
			AppModule.options.disableDocs = true;
			AppModule.options.disableFilter = true;
			AppModule.options.disableLogs = true;
			AppModule.options.disableMetrics = true;
			AppModule.options.disableScan = true;
			AppModule.options.disableValidator = true;
		}

		ConfigModule.set({ key: 'APP_OPTIONS', value: AppModule.options });
	}

	/**
	 * Creates NestJS instance using Fastify as underlying adapter,
	 * then configures the following framework specific settings:
	 * - Add an on request hook which runs prior to all interceptors
	 * - Set the global path prefix if any
	 * - Enable cors if configured
	 * - Enable multipart form-data support
	 */
	private static async configureAdapter(): Promise<void> {
		const { fastify, globalPrefix, cors } = AppModule.options;
		const entryModule = AppModule.buildEntryModule();
		const httpAdapter = new FastifyAdapter(fastify);

		AppModule.instance = await NestFactory.create(entryModule, httpAdapter, {
			logger: ['error', 'warn'],
		});

		const fastifyInstance = AppModule.instance.getHttpAdapter().getInstance();

		fastifyInstance.addHook('onRequest', (req: any, res: any, next: () => void) => {
			AppModule.sanitizeRequestHeaders(req);
			return AppModule.createRequestContext(req, res, next);
		});

		if (globalPrefix) {
			AppModule.instance.setGlobalPrefix(globalPrefix);
		}

		AppModule.instance.enableCors(cors as any);

		await AppModule.instance.register(fastifyMultipart, {
			attachFieldsToBody: 'keyValues',
		});
	}

	/**
	 * Fastify will attempt to parse request body even if content length
	 * is set as zero, this leads to unintended bad requests for some
	 * common http clients.
	 * @param req
	 */
	private static sanitizeRequestHeaders(req: AppRequest): void {
		const { headers } = req;

		if (headers['content-length'] === '0') {
			delete headers['content-type'];
		}
	}

	/**
	 * Implements a request hook intended to run prior to any NestJS
	 * component like guards and interceptors, which:
	 * - Adds starting time to request in order to control timeout
	 * - Set the automatically generated request id as response header
	 * - Wraps the request into a context managed by async local storage
	 * - Wraps the context into a trace span
	 * - Set the trace id as response header.
	 * @param req
	 * @param res
	 * @param next
	 */
	private static createRequestContext(req: AppRequest, res: AppResponse, next: () => void): void {
		const { name } = AppModule.options;
		const contextService = AppModule.instance.get(ContextService);
		const traceService = AppModule.instance.get(TraceService);
		const traceEnabled = traceService?.isEnabled();

		req.time = Date.now();
		res.header('request-id', req.id);

		ContextStorage.run(new Map(), () => {
			const store = ContextStorage.getStore();
			store?.set(ContextStorageKey.REQUEST, req);
			store?.set(ContextStorageKey.RESPONSE, res);

			if (traceEnabled) {
				const ctx = propagation.extract(ROOT_CONTEXT, req.headers);
				const description = contextService.getRequestDescription('in');
				const spanName = `Http | ${description}`;

				context.with(ctx, () => {
					trace.getTracer(name).startActiveSpan(spanName, {}, (span) => {
						const traceId = span.spanContext().traceId;

						res.header('trace-id', traceId);
						store?.set(ContextStorageKey.REQUEST_SPAN, span);

						next();
					});
				});
			} else {
				next();
			}
		});
	}

	/**
	 * Acquire current instance and list on desired port and hostname,
	 * using and interceptor to manage configured timeout.
	 */
	private static async listen(): Promise<void> {
		const { instance, port, hostname, timeout } = AppModule.options;

		const app = AppModule.getInstance();
		const logService = app.get(LogService);

		const httpServer = await app.listen(port, hostname);

		// TimeoutInterceptor should take care of timeout, but set adapter level
		// timeout as a failsafe in case a request is stuck at a guard
		httpServer.setTimeout(timeout * 1.1);

		logService.info(`Instance ${instance} listening on port ${port}`);
	}

	/**
	 * Given desired boot options, build the module that will act
	 * as entry point for the cascade initialization.
	 */
	private static buildEntryModule(): DynamicModule {
		return {
			module: AppModule,
			imports: AppModule.buildModules('imports'),
			controllers: [...AppModule.options.controllers, AppController],
			providers: AppModule.buildProviders(),
			exports: [AppConfig, AppService, ...AppModule.options.providers, ...AppModule.buildModules('exports')],
		};
	}

	/**
	 * Merge defaults, project source and user provided modules.
	 * @param type
	 */
	private static buildModules(type: 'imports' | 'exports'): any[] {
		const { disableScan, disableCache, disableLogs, disableMetrics, disableTraces, disableDocs } = AppModule.options;
		const { envPath, imports: importedModules, exports: exportedModules } = AppModule.options;
		const allowValidationErrors = process.env.NODE_ENV === AppEnvironment.TEST;
		const preloadedModules: any[] = [];
		let sourceModules: unknown[] = [];

		const defaultModules = [ContextModule, LogModule, MemoryModule, PromiseModule];

		if (disableCache) {
			defaultModules.push(CacheDisabledModule);
		} else {
			defaultModules.push(CacheModule);
		}

		if (!disableLogs) {
			defaultModules.push(ConsoleModule, LokiModule);
		}

		if (disableMetrics) {
			defaultModules.push(MetricDisabledModule);
		} else {
			defaultModules.push(MetricModule);
		}

		if (disableTraces) {
			defaultModules.push(TraceDisabledModule);
		} else {
			defaultModules.push(TraceModule);
		}

		if (!disableDocs) {
			defaultModules.push(DocModule);
		}

		if (!disableScan) {
			sourceModules = AppModule.globRequire(['s*rc*/**/*.module.{js,ts}']).reverse();
		}

		if (type === 'imports') {
			preloadedModules.push(
				ConfigModule.registerAsync({ envPath, allowValidationErrors }),
				...defaultModules,
				...sourceModules,
				...importedModules,
			);
		} else {
			preloadedModules.push(ConfigModule, ...defaultModules, ...sourceModules, ...exportedModules);
		}

		return preloadedModules;
	}

	/**
	 * Adds exception filter, serializer, timeout and validation pipe.
	 */
	private static buildProviders(): any[] {
		const { disableFilter, disableValidator, timeout, providers } = AppModule.options;

		const preloadedProviders: any[] = [
			{ provide: APP_INTERCEPTOR, useClass: LogInterceptor },
			{ provide: APP_INTERCEPTOR, useClass: RateInterceptor },
			AppConfig,
			AppService,
		];

		if (timeout) {
			preloadedProviders.push({
				provide: APP_INTERCEPTOR,
				useClass: TimeoutInterceptor,
			});
		}

		if (!disableFilter) {
			preloadedProviders.push({
				provide: APP_FILTER,
				useClass: AppFilter,
			});
		}

		if (!disableValidator) {
			preloadedProviders.push(
				{
					provide: APP_PIPE,
					useClass: ValidatePipe,
				},
				{
					provide: APP_INTERCEPTOR,
					useClass: ValidateInterceptor,
				},
			);
		}

		return [...preloadedProviders, ...providers];
	}

	/**
	 * Given a glob path string, find all matching files
	 * and return an array of their exports.
	 *
	 * If there is a mix of sources and maps, keep only
	 * the JavaScript version.
	 * @param globPathArray
	 * @param root
	 */
	public static globRequire(globPath: string | string[], root?: string): any[] {
		const globPathArray = Array.isArray(globPath) ? globPath : [globPath];
		const cwd = root || process.cwd();

		const matchingFiles = fg.sync(globPathArray, { cwd });
		const jsFiles = matchingFiles.filter((file) => file.match(/\.js$/g));
		const normalizedFiles = jsFiles.length > 0 ? jsFiles : matchingFiles;

		const exportsArrays = normalizedFiles.map((file) => {
			const exportsObject = require(`${cwd}/${file}`);
			return Object.keys(exportsObject).map((key) => exportsObject[key]);
		});

		return exportsArrays.flat();
	}
}
