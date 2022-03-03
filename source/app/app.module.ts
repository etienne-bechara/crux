import 'source-map-support/register';
import 'reflect-metadata';

import { ClassSerializerInterceptor, DynamicModule, Global, INestApplication, Module, ValidationPipe } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE, NestFactory } from '@nestjs/core';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import fg from 'fast-glob';
import fs from 'fs';
import handlebars from 'handlebars';
import path from 'path';

import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';
import { ConsoleModule } from '../console/console.module';
import { ContextStorageKey } from '../context/context.enum';
import { ContextModule } from '../context/context.module';
import { ContextStorage } from '../context/context.storage';
import { HttpModule } from '../http/http.module';
import { LoggerModule } from '../logger/logger.module';
import { LoggerService } from '../logger/logger.service';
import { MetricDisabledModule, MetricModule } from '../metric/metric.module';
import { RedocModule } from '../redoc/redoc.module';
import { SentryModule } from '../sentry/sentry.module';
import { SlackModule } from '../slack/slack.module';
import { APP_DEFAULT_OPTIONS, AppConfig } from './app.config';
import { AppController } from './app.controller';
import { AppFilter } from './app.filter';
import { AppLoggerInterceptor, AppTimeoutInterceptor } from './app.interceptor';
import { AppOptions } from './app.interface';
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
    const { instance } = options;

    if (instance) {
      this.instance = instance;
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

    if (!this.options.disableDocumentation) {
      this.configureDocumentation();
    }

    return this.instance;
  }

  /**
   * Merge compile options with default and persist them as configuration .
   * @param options
   */
  private static configureOptions(options: AppOptions): void {
    const redoc = { ...APP_DEFAULT_OPTIONS.redoc, ...options.redoc };
    const fastify = { ...APP_DEFAULT_OPTIONS.fastify, ...options.fastify };

    this.options = { ...APP_DEFAULT_OPTIONS, ...options, redoc, fastify };
    ConfigService.setSecret({ key: 'APP_OPTIONS', value: this.options });
  }

  /**
   * Creates NestJS instance and configures Fastify adapter
   * adding a hook for async local storage support.
   */
  private static async configureAdapter(): Promise<void> {
    const { fastify, globalPrefix, cors } = this.options;
    const entryModule = this.buildEntryModule();
    const httpAdapter = new FastifyAdapter(fastify);

    this.instance = await NestFactory.create(entryModule, httpAdapter, {
      logger: [ 'error', 'warn' ],
    });

    const fastifyInstance = this.instance.getHttpAdapter().getInstance();

    fastifyInstance.addHook('preHandler', (req, res, next) => {
      req.time = Date.now();
      res.header('request-id', req.id);

      ContextStorage.run(new Map(), () => {
        const store = ContextStorage.getStore();
        store.set(ContextStorageKey.REQUEST, req);
        store.set(ContextStorageKey.RESPONSE, res);
        next();
      });
    });

    this.instance.setGlobalPrefix(globalPrefix);
    this.instance.enableCors(cors);
  }

  /**
   * Configures static documentation, adding logo and better API
   * endpoint naming.
   */
  private static configureDocumentation(): void {
    const { title, description, version, logo, tagGroups, documentBuilder } = this.options.redoc;

    this.instance['setViewEngine']({
      engine: { handlebars },
      // eslint-disable-next-line unicorn/prefer-module
      templates: path.join(__dirname, '..', 'redoc'),
    });

    const builder = documentBuilder || new DocumentBuilder()
      .setTitle(title)
      .setDescription(description)
      .setVersion(version);

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

    document['x-tagGroups'] = tagGroups;
    document.info['x-logo'] = logo;

    SwaggerModule.setup('openapi', this.instance, document);
  }

  /**
   * Acquire current instance and list on desired port and hostname,
   * using and interceptor to manage configured timeout.
   */
  private static async listen(): Promise<void> {
    const { port, hostname, timeout } = this.options;
    const timeoutStr = timeout ? `set to ${(timeout / 1000).toString()}s` : 'disabled';

    const app = this.getInstance();
    const loggerService = app.get(LoggerService);

    const httpServer = await app.listen(port, hostname);
    httpServer.setTimeout(0);

    loggerService.debug(`Server timeout ${timeoutStr}`);
    loggerService.info(`Server listening on port ${port}`);
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
    const { disableScan, disableLogger, disableMetrics, disableDocumentation } = this.options;
    const { envPath, imports, exports } = this.options;
    const preloadedModules: any[] = [ ];
    let sourceModules: unknown[] = [ ];

    const defaultModules = [
      LoggerModule,
      ContextModule,
      HttpModule.register({
        name: 'AppModule',
        responseType: 'json',
        resolveBodyOnly: true,
      }),
    ];

    if (!disableLogger) {
      defaultModules.push(
        ConsoleModule,
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

    if (!disableDocumentation) {
      defaultModules.push(RedocModule);
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
    const preloadedControllers = [ ...controllers ];

    if (!disableStatus) {
      preloadedControllers.push(AppController);
    }

    return preloadedControllers;
  }

  /**
   * Adds exception filter, serializer, logger, timeout
   * and validation pipe.
   */
  private static buildProviders(): any[] {
    const { disableFilter, disableSerializer, disableValidator, providers } = this.options;

    const preloadedProviders: any[] = [
      { provide: APP_INTERCEPTOR, useClass: AppLoggerInterceptor },
      { provide: APP_INTERCEPTOR, useClass: AppTimeoutInterceptor },
      AppConfig,
      AppService,
    ];

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
