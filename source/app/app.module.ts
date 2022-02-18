import 'source-map-support/register';
import 'reflect-metadata';

import { ClassSerializerInterceptor, DynamicModule, Global, INestApplication, Module, ValidationPipe } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE, NestFactory } from '@nestjs/core';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import fg from 'fast-glob';
import fs from 'fs';

import { ConfigModule } from '../config/config.module';
import { ContextStorageKey } from '../context/context.enum';
import { ContextModule } from '../context/context.module';
import { ContextStorage } from '../context/context.storage';
import { HttpModule } from '../http/http.module';
import { LoggerModule } from '../logger/logger.module';
import { ConsoleModule } from '../logger/logger.transport/console/console.module';
import { SentryModule } from '../logger/logger.transport/sentry/sentry.module';
import { SlackModule } from '../logger/logger.transport/slack/slack.module';
import { AppConfig } from './app.config';
import { AppController } from './app.controller';
import { AppFilter } from './app.filter';
import { AppLoggerInterceptor, AppTimeoutInterceptor } from './app.interceptor';
import { AppOptions } from './app.interface';
import { LoggerService } from './app.override';
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
   * Returns options which the application was built upon.
   */
  public static getOptions(): AppOptions {
    this.getInstance();
    return this.options;
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
    this.options = options;

    const entryModule = this.buildEntryModule();

    const httpAdapter = new FastifyAdapter({
      trustProxy: true,
      ...this.options.adapterOptions,
    });

    this.instance = await NestFactory.create(entryModule, httpAdapter, {
      logger: [ 'error', 'warn' ],
    });

    const fastify = this.instance.getHttpAdapter().getInstance();

    fastify.addHook('preHandler', (req, res, next) => {
      ContextStorage.run(new Map(), () => {
        const store = ContextStorage.getStore();
        store.set(ContextStorageKey.REQUEST, req);
        store.set(ContextStorageKey.RESPONSE, res);
        next();
      });
    });

    const appConfig: AppConfig = this.instance.get(AppConfig);

    this.options.port ??= appConfig.APP_PORT;
    this.options.hostname ??= appConfig.APP_HOSTNAME;
    this.options.globalPrefix ??= appConfig.APP_GLOBAL_PREFIX;
    this.options.timeout ??= appConfig.APP_TIMEOUT;
    this.options.cors ??= appConfig.APP_CORS_OPTIONS;
    this.options.httpErrors ??= appConfig.APP_FILTER_HTTP_ERRORS;

    this.instance.setGlobalPrefix(this.options.globalPrefix);
    this.instance.enableCors(this.options.cors);

    return this.instance;
  }

  /**
   * Acquire current instance and list on desired port and hostname,
   * using and interceptor to manage configured timeout.
   */
  private static async listen(): Promise<void> {
    const { port, hostname, timeout } = this.options;
    const app = this.getInstance();
    const loggerService = app.get(LoggerService);
    const httpServer = await app.listen(port, hostname);
    const timeoutStr = timeout ? `set to ${(timeout / 1000).toString()}s` : 'disabled';

    httpServer.setTimeout(0);
    loggerService.debug(`[AppService] Server timeout ${timeoutStr}`);
    loggerService.info(`[AppService] Server listening on port ${port}`);
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
    const { envPath, disableModuleScan, disableLogger, imports, exports } = this.options;
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

    if (!disableModuleScan) {
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
    const { disableControllers, controllers } = this.options;
    const preloadedControllers = [ ...controllers ];

    if (!disableControllers) {
      preloadedControllers.push(AppController);
    }

    return preloadedControllers;
  }

  /**
   * Adds exception filter, serializer, logger, timeout
   * and validation pipe.
   */
  private static buildProviders(): any[] {
    const { disableFilters, disableInterceptors, disablePipes, providers } = this.options;

    const preloadedProviders: any[] = [
      AppConfig,
      AppService,
    ];

    if (!disableFilters) {
      preloadedProviders.push({
        provide: APP_FILTER,
        useClass: AppFilter,
      });
    }

    if (!disableInterceptors) {
      preloadedProviders.push(
        { provide: APP_INTERCEPTOR, useClass: ClassSerializerInterceptor },
        { provide: APP_INTERCEPTOR, useClass: AppLoggerInterceptor },
        { provide: APP_INTERCEPTOR, useClass: AppTimeoutInterceptor },
      );
    }

    if (!disablePipes) {
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
