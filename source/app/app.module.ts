import 'source-map-support/register';
import 'reflect-metadata';

import { DynamicModule, Global, INestApplication, Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE, NestFactory } from '@nestjs/core';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import { context, propagation, ROOT_CONTEXT, trace } from '@opentelemetry/api';
import fg from 'fast-glob';
import handlebars from 'handlebars';

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
import { SlackModule } from '../slack/slack.module';
import { TimeoutInterceptor } from '../timeout/timeout.interceptor';
import { TraceDisabledModule, TraceModule } from '../trace/trace.module';
import { TraceService } from '../trace/trace.service';
import { TransformInterceptor } from '../transform/transform.interceptor';
import { ValidatePipe } from '../validate/validate.pipe';
import { APP_DEFAULT_OPTIONS, AppConfig } from './app.config';
import { AppController } from './app.controller';
import { AppFilter } from './app.filter';
import { AppOptions, AppRequest, AppResponse } from './app.interface';
import { AppService } from './app.service';

@Global()
@Module({ })
export class AppModule {

  private static instance: INestApplication;
  private static options: AppOptions;

  /**
   * Returns application instance.
   */
  public static getInstance(): INestApplication {
    if (!this.instance) {
      throw new Error('application instance not configured');
    }

    return this.instance;
  }

  /**
   * Closes application instance.
   */
  public static async close(): Promise<void> {
    await this.instance.close();
    this.instance = undefined;
  }

  /**
   * Boots an instance of a Nest Application using Fastify, and listen
   * on desired port and hostname.
   *
   * Skips the compile step if a pre-compiled `instance` is provided.
   * @param options
   */
  public static async boot(options: AppOptions = { }): Promise<INestApplication> {
    const { app } = options;

    if (app) {
      this.instance = app;
    }
    else {
      await this.compile(options);
    }

    await this.listen();
    return this.instance;
  }

  /**
   * Builds and configures an instance of a Nest Application, returning
   * its reference without starting the adapter.
   * @param options
   */
  public static async compile(options: AppOptions = { }): Promise<INestApplication> {
    this.configureOptions(options);
    await this.configureAdapter();

    if (!this.options.disableDocs) {
      DocModule.configureDocumentation(this.instance, this.options);
    }

    return this.instance;
  }

  /**
   * Merge compile options with default and persist them as configuration .
   * @param options
   */
  private static configureOptions(options: AppOptions): void {
    const deepMergeProps: (keyof AppOptions)[] = [
      'cache',
      'console',
      'docs',
      'fastify',
      'logs',
      'loki',
      'metrics',
      'slack',
      'traces',
    ];

    this.options = { ...APP_DEFAULT_OPTIONS, ...options };

    for (const key of deepMergeProps) {
      const defaultData = APP_DEFAULT_OPTIONS[key] as Record<string, any>;
      const providedData = options[key] as Record<string, any>;

      this.options[key as string] = { ...defaultData, ...providedData };
    }

    if (this.options.disableAll) {
      this.options.disableCache = true;
      this.options.disableDocs = true;
      this.options.disableFilter = true;
      this.options.disableLogs = true;
      this.options.disableMetrics = true;
      this.options.disableScan = true;
      this.options.disableSerializer = true;
      this.options.disableStatus = true;
      this.options.disableValidator = true;
    }

    ConfigModule.set({ key: 'APP_OPTIONS', value: this.options });
  }

  /**
   * Creates NestJS instance using Fastify as underlying adapter,
   * then configures the following framework specific settings:
   * - Add an on request hook which runs prior to all interceptors
   * - Set the global path prefix if any
   * - Enable cors if configured
   * - Maps a local directory to serve static assets
   * - Configures handlebars as view engine to support ReDoc.
   */
  private static async configureAdapter(): Promise<void> {
    const { fastify, globalPrefix, assetsPrefix, cors } = this.options;
    const entryModule = this.buildEntryModule();
    const httpAdapter = new FastifyAdapter(fastify);

    this.instance = await NestFactory.create(entryModule, httpAdapter, {
      logger: [ 'error', 'warn' ],
    });

    const fastifyInstance = this.instance.getHttpAdapter().getInstance();

    fastifyInstance.addHook('onRequest', (req: AppRequest, res: AppResponse, next: () => void) => {
      this.sanitizeRequestHeaders(req);
      return this.createRequestContext(req, res, next);
    });

    this.instance.setGlobalPrefix(globalPrefix);
    this.instance.enableCors(cors);

    this.instance.getHttpAdapter().useStaticAssets({
      // eslint-disable-next-line unicorn/prefer-module
      root: `${process.cwd()}/${assetsPrefix}`,
      prefix: `/${assetsPrefix}/`,
    });

    this.instance.getHttpAdapter().setViewEngine({
      engine: { handlebars },
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
    const { name } = this.options;
    const contextService = this.instance.get(ContextService);
    const traceService = this.instance.get(TraceService);
    const traceEnabled = traceService?.isEnabled();

    req.time = Date.now();
    res.header('request-id', req.id);

    ContextStorage.run(new Map(), () => {
      const store = ContextStorage.getStore();
      store.set(ContextStorageKey.REQUEST, req);
      store.set(ContextStorageKey.RESPONSE, res);

      if (traceEnabled) {
        const ctx = propagation.extract(ROOT_CONTEXT, req.headers);
        const description = contextService.getRequestDescription('in');
        const spanName = `Http | ${description}`;

        context.with(ctx, () => {
          trace.getTracer(name).startActiveSpan(spanName, { }, (span) => {
            const traceId = span.spanContext().traceId;

            res.header('trace-id', traceId);
            store.set(ContextStorageKey.REQUEST_SPAN, span);

            next();
          });
        });
      }
      else {
        next();
      }
    });
  }

  /**
   * Acquire current instance and list on desired port and hostname,
   * using and interceptor to manage configured timeout.
   */
  private static async listen(): Promise<void> {
    const { instance, port, hostname, timeout } = this.options;

    const app = this.getInstance();
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
    this.options.controllers ??= [ ];
    this.options.providers ??= [ ];
    this.options.imports ??= [ ];
    this.options.exports ??= [ ];

    return {
      module: AppModule,
      imports: this.buildModules('imports'),
      controllers: this.buildControllers(),
      providers: this.buildProviders(),
      exports: [
        AppConfig,
        AppService,
        ...this.options.providers,
        ...this.buildModules('exports'),
      ],
    };
  }

  /**
   * Merge defaults, project source and user provided modules.
   * @param type
   */
  private static buildModules(type: 'imports' | 'exports'): any[] {
    const { disableScan, disableCache, disableLogs, disableMetrics, disableTraces, disableDocs } = this.options;
    const { envPath, imports: importedModules, exports: exportedModules } = this.options;
    const preloadedModules: any[] = [ ];
    let sourceModules: unknown[] = [ ];

    const defaultModules = [
      ContextModule,
      LogModule,
      MemoryModule,
      PromiseModule,
    ];

    if (!disableCache) {
      defaultModules.push(CacheModule);
    }
    else {
      defaultModules.push(CacheDisabledModule);
    }

    if (!disableLogs) {
      defaultModules.push(
        ConsoleModule,
        LokiModule,
        SlackModule,
      );
    }

    if (!disableMetrics) {
      defaultModules.push(MetricModule);
    }
    else {
      defaultModules.push(MetricDisabledModule);
    }

    if (!disableTraces) {
      defaultModules.push(TraceModule);
    }
    else {
      defaultModules.push(TraceDisabledModule);
    }

    if (!disableDocs) {
      defaultModules.push(DocModule);
    }

    if (!disableScan) {
      sourceModules = AppModule.globRequire([ 's*rc*/**/*.module.{js,ts}' ]).reverse();
    }

    if (type === 'imports') {
      preloadedModules.push(
        ConfigModule.registerAsync({ envPath }),
        ...defaultModules,
        ...sourceModules,
        ...importedModules,
      );
    }
    else {
      preloadedModules.push(
        ConfigModule,
        ...defaultModules,
        ...sourceModules,
        ...exportedModules,
      );
    }

    return preloadedModules;
  }

  /**
   * Adds app controller with machine status information.
   */
  private static buildControllers(): any[] {
    const { disableStatus, controllers } = this.options;
    const preloadedControllers = [ ];

    if (!disableStatus) {
      preloadedControllers.push(AppController);
    }

    return [ ...preloadedControllers, ...controllers ];
  }

  /**
   * Adds exception filter, serializer, timeout and validation pipe.
   */
  private static buildProviders(): any[] {
    const { disableFilter, disableSerializer, disableValidator, timeout, providers } = this.options;

    const preloadedProviders: any[] = [
      { provide: APP_INTERCEPTOR, useClass: LogInterceptor },
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

    if (!disableSerializer) {
      preloadedProviders.push({
        provide: APP_INTERCEPTOR,
        useClass: TransformInterceptor,
      });
    }

    if (!disableValidator) {
      preloadedProviders.push({
        provide: APP_PIPE,
        useClass: ValidatePipe,
      });
    }

    return [ ...preloadedProviders, ...providers ];
  }

  /**
   * Given a glob path string, find all matching files
   * and return an array of their exports.
   *
   * If there is a mix of sources and maps, keep only
   * the JavaScript version.
   * @param globPath
   * @param root
   */
  public static globRequire(globPath: string | string[], root?: string): any[] {
    globPath = Array.isArray(globPath) ? globPath : [ globPath ];
    const cwd = root || process.cwd();

    const matchingFiles = fg.sync(globPath, { cwd });
    const jsFiles = matchingFiles.filter((file) => file.match(/\.js$/g));
    const normalizedFiles = jsFiles.length > 0 ? jsFiles : matchingFiles;

    const exportsArrays = normalizedFiles.map((file) => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires, unicorn/prefer-module
      const exportsObject: unknown = require(`${cwd}/${file}`);
      return Object.keys(exportsObject).map((key) => exportsObject[key]);
    });

    return exportsArrays.flat();
  }

}
