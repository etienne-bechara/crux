import 'source-map-support/register';
import 'reflect-metadata';

import { ClassSerializerInterceptor, DynamicModule, Global, INestApplication, Module, ValidationPipe } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE, NestFactory } from '@nestjs/core';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { propagation, ROOT_CONTEXT, trace } from '@opentelemetry/api';
import fg from 'fast-glob';
import fs from 'fs';
import handlebars from 'handlebars';
import path from 'path';

import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';
import { ConsoleModule } from '../console/console.module';
import { ContextStorageKey } from '../context/context.enum';
import { ContextModule } from '../context/context.module';
import { ContextService } from '../context/context.service';
import { ContextStorage } from '../context/context.storage';
import { DocModule } from '../doc/doc.module';
import { HttpModule } from '../http/http.module';
import { LogModule } from '../log/log.module';
import { LogService } from '../log/log.service';
import { LokiModule } from '../loki/loki.module';
import { MemoryModule } from '../memory/memory.module';
import { MemoryService } from '../memory/memory.service';
import { MetricDisabledModule, MetricModule } from '../metric/metric.module';
import { PromiseModule } from '../promise/promise.module';
import { SentryModule } from '../sentry/sentry.module';
import { SlackModule } from '../slack/slack.module';
import { TraceModule, TracerDisabledModule } from '../trace/trace.module';
import { APP_DEFAULT_OPTIONS, AppConfig } from './app.config';
import { AppController } from './app.controller';
import { TagStorage } from './app.decorator';
import { AppFilter } from './app.filter';
import { AppInterceptor } from './app.interceptor';
import { AppMemory, AppOptions } from './app.interface';
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
      this.configureDocumentation();
    }

    return this.instance;
  }

  /**
   * Merge compile options with default and persist them as configuration .
   * @param options
   */
  private static configureOptions(options: AppOptions): void {
    const deepMergeProps: (keyof AppOptions)[] = [
      'fastify',
      'console',
      'loki',
      'sentry',
      'slack',
      'metrics',
      'docs',
    ];

    this.options = { ...APP_DEFAULT_OPTIONS, ...options };

    for (const key of deepMergeProps) {
      const defaultData = APP_DEFAULT_OPTIONS[key] as Record<string, any>;
      const providedData = options[key] as Record<string, any>;

      this.options[key as string] = { ...defaultData, ...providedData };
    }

    if (this.options.disableAll) {
      this.options.disableDocs = true;
      this.options.disableFilter = true;
      this.options.disableLogs = true;
      this.options.disableMetrics = true;
      this.options.disableScan = true;
      this.options.disableSerializer = true;
      this.options.disableStatus = true;
      this.options.disableValidator = true;
    }

    ConfigService.setSecret({ key: 'APP_OPTIONS', value: this.options });
  }

  /**
   * Creates NestJS instance and configures Fastify adapter
   * adding a hook for async local storage support.
   */
  private static async configureAdapter(): Promise<void> {
    const { job, fastify, prefix, cors } = this.options;
    const entryModule = this.buildEntryModule();
    const httpAdapter = new FastifyAdapter(fastify);

    this.instance = await NestFactory.create(entryModule, httpAdapter, {
      logger: [ 'error', 'warn' ],
    });

    const fastifyInstance = this.instance.getHttpAdapter().getInstance();
    const contextService = this.instance.get(ContextService);

    fastifyInstance.addHook('onRequest', (req, res, next) => {
      req.time = Date.now();
      res.header('request-id', req.id);

      ContextStorage.run(new Map(), () => {
        const store = ContextStorage.getStore();
        const tracer = trace.getTracer(job);

        store.set(ContextStorageKey.REQUEST, req);
        store.set(ContextStorageKey.RESPONSE, res);
        store.set(ContextStorageKey.TRACER, tracer);

        const description = contextService.getRequestDescription('in');
        const ctx = propagation.extract(ROOT_CONTEXT, req.headers);
        const span = trace.getTracer(job).startSpan(description, { }, ctx);
        const traceId = span.spanContext().traceId;

        store.set(ContextStorageKey.METADATA, { span, traceId });

        next();
      });
    });

    this.instance.setGlobalPrefix(prefix);
    this.instance.enableCors(cors);
  }

  /**
   * Configures static documentation, adding logo and better API
   * endpoint naming.
   */
  private static configureDocumentation(): void {
    const { title, description, version, logo, tagGroups, documentBuilder } = this.options.docs;
    const memoryService: MemoryService<AppMemory> = this.instance.get(MemoryService);

    this.instance['setViewEngine']({
      engine: { handlebars },
      // eslint-disable-next-line unicorn/prefer-module
      templates: path.join(__dirname, '..', 'doc'),
    });

    const builder = documentBuilder || new DocumentBuilder()
      .setTitle(title)
      .setDescription(description)
      .setVersion(version);

    // Standardize operation ID names
    const document = SwaggerModule.createDocument(this.instance, builder.build(), {
      operationIdFactory: (controllerKey: string, methodKey: string) => {
        const entityName = controllerKey.replace('Controller', '');
        const defaultId = `${controllerKey}_${methodKey}`;
        let operationId: string;

        switch (methodKey.slice(0, 3)) {
          case 'get' : operationId = `Read ${entityName}`; break;
          case 'pos' : operationId = `Create ${entityName}`; break;
          case 'put' : operationId = `Replace ${entityName}`; break;
          case 'pat' : operationId = `Update ${entityName}`; break;
          case 'del' : operationId = `Delete ${entityName}`; break;
          default: operationId = defaultId;
        }

        if (methodKey.includes('Id')) {
          operationId = `${operationId} by ID`;
        }

        return entityName ? operationId : defaultId;
      },
    });

    // Standardize tag grouping
    const appTagGroups = [
      ...tagGroups || [ ],
      { name: 'Application', tags: [ 'Docs', 'Metrics', 'Status' ] },
    ];

    const appTags = new Set(appTagGroups.flatMap((t) => t.tags));
    const ungroupedTags = TagStorage.filter((t) => !appTags.has(t));

    if (ungroupedTags.length > 0) {
      appTagGroups.push({ name: 'API', tags: ungroupedTags });
    }

    appTagGroups.sort((a, b) => a.name > b.name ? 1 : -1);
    for (const t of appTagGroups) t.tags.sort();

    // Saves specification to memory
    memoryService.setKey('openApiSpecification', JSON.stringify(document));

    document['x-tagGroups'] = appTagGroups;
    document.info['x-logo'] = logo;

    SwaggerModule.setup('openapi', this.instance, document);
  }

  /**
   * Acquire current instance and list on desired port and hostname,
   * using and interceptor to manage configured timeout.
   */
  private static async listen(): Promise<void> {
    const { instance, port, hostname } = this.options;

    const app = this.getInstance();
    const logService = app.get(LogService);

    const httpServer = await app.listen(port, hostname);
    httpServer.setTimeout(0);

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
    const { disableScan, disableLogs, disableMetrics, disableTraces, disableDocs } = this.options;
    const { envPath, imports, exports } = this.options;
    const preloadedModules: any[] = [ ];
    let sourceModules: unknown[] = [ ];

    const defaultModules = [
      ContextModule,
      LogModule,
      MemoryModule,
      PromiseModule,
      HttpModule.register({
        name: 'AppModule',
        responseType: 'json',
        resolveBodyOnly: true,
      }),
    ];

    if (!disableLogs) {
      defaultModules.push(
        ConsoleModule,
        LokiModule,
        SentryModule,
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
      defaultModules.push(TracerDisabledModule);
    }

    if (!disableDocs) {
      defaultModules.push(DocModule);
    }

    if (!disableScan) {
      sourceModules = AppModule.globRequire([ 's*rc*/**/*.module.{js,ts}' ]).reverse();
    }

    if (type === 'imports') {
      preloadedModules.push(
        ConfigModule.register({ envPath }),
        ...defaultModules,
        ...sourceModules,
        ...imports,
      );
    }
    else {
      preloadedModules.push(
        ConfigModule,
        ...defaultModules,
        ...sourceModules,
        ...exports,
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
      AppConfig,
      AppService,
    ];

    if (timeout) {
      preloadedProviders.push({
        provide: APP_INTERCEPTOR,
        useClass: AppInterceptor,
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
        useClass: ClassSerializerInterceptor,
      });
    }

    if (!disableValidator) {
      preloadedProviders.push({
        provide: APP_PIPE,
        useFactory: (): ValidationPipe => new ValidationPipe({
          whitelist: true,
          forbidNonWhitelisted: true,
        }),
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

  /**
   * Given current working directory, attempt to find
   * an .env file up to the desired maximum depth.
   * @param maxDepth
   */
  public static searchEnvFile(maxDepth: number = 5): string {
    let testPath = process.cwd();
    let testFile = `${testPath}/.env`;

    for (let i = 0; i < maxDepth; i++) {
      const pathExist = fs.existsSync(testPath);
      const fileExist = fs.existsSync(testFile);

      if (!pathExist) break;
      if (fileExist) return testFile;

      testPath = `${testPath}/..`;
      testFile = testFile.replace(/\.env$/g, '../.env');
    }
  }

}
