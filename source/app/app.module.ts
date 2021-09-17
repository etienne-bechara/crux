import 'source-map-support/register';
import 'reflect-metadata';

import { ClassSerializerInterceptor, DynamicModule, Global, INestApplication, Module, ValidationPipe } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE, NestFactory } from '@nestjs/core';
import { FastifyAdapter } from '@nestjs/platform-fastify';

import { ConfigModule } from '../config/config.module';
import { LoggerConfig } from '../logger/logger.config';
import { LoggerModule } from '../logger/logger.module';
import { ConsoleConfig } from '../logger/logger.transport/console/console.config';
import { ConsoleModule } from '../logger/logger.transport/console/console.module';
import { SentryConfig } from '../logger/logger.transport/sentry/sentry.config';
import { SentryModule } from '../logger/logger.transport/sentry/sentry.module';
import { SlackConfig } from '../logger/logger.transport/slack/slack.config';
import { SlackModule } from '../logger/logger.transport/slack/slack.module';
import { RequestModule } from '../request/request.module';
import { RequestStorage } from '../request/request.storage';
import { UtilModule } from '../util/util.module';
import { AppConfig } from './app.config';
import { AppFilter } from './app.filter';
import { AppLoggerInterceptor, AppTimeoutInterceptor } from './app.interceptor';
import { AppOptions } from './app.interface/app.options';
import { LoggerService } from './app.override';

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
   * Builds and configures an instance of Nest Application using Fastify
   * and listen on desired port and hostname.
   * @param options
   */
  public static async boot(options: AppOptions = { }): Promise<INestApplication> {
    const app = await this.compile(options);
    await this.listen();
    return app;
  }

  /**
   * Builds and configures an instance of Nest Application using Fastify
   * and returns its reference without starting the adapter.
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
      RequestStorage.run(new Map(), () => {
        const store = RequestStorage.getStore();
        store.set('req', req);
        store.set('res', res);
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
    this.options.configs ??= [ ];
    this.options.controllers ??= [ ];
    this.options.providers ??= [ ];
    this.options.imports ??= [ ];
    this.options.exports ??= [ ];

    return {
      module: AppModule,
      controllers: this.options.controllers,
      imports: this.buildEntryModules('imports'),
      providers: this.buildEntryProviders(),
      exports: [
        AppConfig,
        ...this.options.providers,
        ...this.buildEntryModules('exports'),
      ],
    };
  }

  /**
   * Merge default, project source and user provided configs.
   */
  private static buildEntryConfigs(): any[] {
    const { disableConfigScan, configs } = this.options;

    const preloadedConfigs = [
      AppConfig,
      LoggerConfig,
      ConsoleConfig,
      SentryConfig,
      SlackConfig,
    ];

    if (!disableConfigScan) {
      const sourceConfigs = UtilModule.globRequire([ 's*rc*/**/*.config.{js,ts}' ]);
      preloadedConfigs.push(...sourceConfigs);
    }

    return [ ...preloadedConfigs, ...configs ];
  }

  /**
   * Merge defaults, project source and user provided modules.
   * @param type
   */
  private static buildEntryModules(type: 'imports' | 'exports'): any[] {
    const { envPath, disableModuleScan, disableLogger, imports, exports } = this.options;
    const preloadedModules: any[] = [ ];

    const defaultModules: any[] = [
      LoggerModule,
      RequestModule,
      UtilModule,
    ];

    if (!disableLogger) {
      defaultModules.push(
        ConsoleModule,
        SentryModule,
        SlackModule,
      );
    }

    if (type === 'imports') {
      preloadedModules.push(
        ConfigModule.register({
          envPath: envPath,
          configs: this.buildEntryConfigs(),
        }),
        ...defaultModules,
      );
    }
    else {
      preloadedModules.push(
        ConfigModule,
        ...defaultModules,
      );
    }

    if (!disableModuleScan) {
      const sourceModules = UtilModule.globRequire([ 's*rc*/**/*.module.{js,ts}' ]).reverse();
      preloadedModules.push(...sourceModules);
    }

    if (type === 'imports') {
      preloadedModules.push(...imports);
    }
    else {
      preloadedModules.push(...exports);
    }

    return preloadedModules;
  }

  /**
   * Adds exception filter, serializer, logger, timeout
   * and validation pipe.
   */
  private static buildEntryProviders(): any[] {
    const { disableFilters, disableInterceptors, disablePipes, providers } = this.options;
    const preloadedProviders: any[] = [ AppConfig ];

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

}
