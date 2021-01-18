import 'source-map-support/register';
import 'reflect-metadata';

import { ClassSerializerInterceptor, DynamicModule, Global,
  MiddlewareConsumer, Module, ValidationPipe } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE, NestFactory } from '@nestjs/core';
import { json } from 'express';

import { ConfigModule } from '../config/config.module';
import { HttpsConfig } from '../https/https.config';
import { LoggerConfig } from '../logger/logger.config';
import { LoggerModule } from '../logger/logger.module';
import { LoggerService } from '../logger/logger.service';
import { ConsoleConfig } from '../logger/logger.transport/console/console.config';
import { ConsoleModule } from '../logger/logger.transport/console/console.module';
import { SentryConfig } from '../logger/logger.transport/sentry/sentry.config';
import { SentryModule } from '../logger/logger.transport/sentry/sentry.module';
import { SlackModule } from '../logger/logger.transport/slack/slack.module';
import { UtilConfig } from '../util/util.config';
import { UtilModule } from '../util/util.module';
import { AppConfig } from './app.config';
import { AppFilter } from './app.filter';
import { AppLoggerInterceptor, AppTimeoutInterceptor } from './app.interceptor';
import { AppBootOptions } from './app.interface/app.boot.options';
import { AppMiddleware } from './app.middleware';

@Global()
@Module({ })
export class AppModule {

  /**
   * Applies a global middleware that acts on
   * request before anything else.
   * @param consumer
   */
  public configure(consumer: MiddlewareConsumer): void {
    consumer.apply(AppMiddleware).forRoutes('*');
  }

  /**
   * Starts Express server through Nest JS framework.
   * Apply the following customizations according to config:
   * • Configure CORS
   * • Set JSON limit
   * • Disable timeout (handled in custom interceptor).
   * @param options
   */
  public static async bootServer(options: AppBootOptions = { }): Promise<void> {
    const entryModule = this.buildEntryModule(options);

    const nestApp = await NestFactory.create(entryModule, {
      logger: [ 'error', 'warn' ],
    });

    const appConfig: AppConfig = nestApp.get('AppConfig');
    const loggerService: LoggerService = nestApp.get('LoggerService');

    nestApp.setGlobalPrefix(appConfig.APP_GLOBAL_PREFIX);
    nestApp.enableCors(appConfig.APP_CORS_OPTIONS);
    nestApp.use(
      json({ limit: appConfig.APP_JSON_LIMIT }),
    );

    const httpServerPort = appConfig.APP_PORT;
    const httpServer = await nestApp.listen(httpServerPort);
    httpServer.setTimeout(0);

    const timeoutStr = appConfig.APP_TIMEOUT
      ? `set to ${(appConfig.APP_TIMEOUT / 1000).toString()}s`
      : 'disabled';
    loggerService.debug(`Server timeouts are ${timeoutStr}`);
    loggerService.notice(`Server listening on port ${httpServerPort}`);
  }

  /**
   * Given desired boot options, build the module that will act
   * as entry point for the cascade initialization.
   * @param options
   */
  private static buildEntryModule(options: AppBootOptions = { }): DynamicModule {
    if (!options.configs) options.configs = [ ];
    if (!options.modules) options.modules = [ ];

    return {
      module: AppModule,
      providers: this.buildEntryProviders(options),
      imports: this.buildEntryModules(options, 'imports'),
      exports: this.buildEntryModules(options, 'exports'),
    };
  }

  /**
   * Merge default, project source and user provided modules.
   * @param options
   */
  private static buildEntryConfigs(options: AppBootOptions): any[] {
    const preloadedConfigs = [ ];

    const defaultConfigs = [
      AppConfig,
      HttpsConfig,
      LoggerConfig,
      ConsoleConfig,
      SentryConfig,
      UtilConfig,
    ];

    if (!options.disableDefaultImports) {
      preloadedConfigs.push(...defaultConfigs);
    }

    if (!options.disableSourceImports) {
      const sourceConfigs = UtilModule.globRequire([
        's*rc*/**/*.config.{js,ts}',
        '!**/*test*',
      ]);
      preloadedConfigs.push(...sourceConfigs);
    }

    return [ ...preloadedConfigs, ...options.configs ];
  }

  /**
   * Merge defaults, project source and user provided modules.
   * @param options
   * @param type
   */
  private static buildEntryModules(options: AppBootOptions, type: 'imports' | 'exports'): any[] {
    const preloadedModules = [ ];

    const defaultModules = [
      ConsoleModule,
      LoggerModule,
      SentryModule,
      SlackModule,
      UtilModule,
    ];

    if (!options.disableDefaultImports) {
      preloadedModules.push(

        type === 'exports'
          ? ConfigModule
          : ConfigModule.registerAsync({
            envPath: options.envPath,
            configs: [
              ...this.buildEntryConfigs(options),
              ...options.configs,
            ],
          }),

        ...defaultModules,
      );
    }

    if (!options.disableDefaultImports) {
      const sourceModules = UtilModule.globRequire([
        's*rc*/**/*.module.{js,ts}',
        '!**/*test*',
      ]);
      preloadedModules.push(...sourceModules);
    }

    return [ ...preloadedModules, ...options.modules ];
  }

  /**
   * Adds exception filter, serializer, logger, timeout
   * and validation pipe.
   * @param options
   */
  private static buildEntryProviders(options: AppBootOptions): any[] {
    const preloadedProviders: any[] = [ AppConfig ];

    if (!options.disableDefaultFilters) {
      preloadedProviders.push({
        provide: APP_FILTER,
        useClass: AppFilter,
      });
    }

    if (!options.disableDefaultInterceptors) {
      preloadedProviders.push(
        { provide: APP_INTERCEPTOR, useClass: ClassSerializerInterceptor },
        { provide: APP_INTERCEPTOR, useClass: AppLoggerInterceptor },
        { provide: APP_INTERCEPTOR, useClass: AppTimeoutInterceptor },
      );
    }

    if (!options.disableDefaultPipes) {
      preloadedProviders.push({
        provide: APP_PIPE,
        useFactory: (): ValidationPipe => new ValidationPipe({
          whitelist: true,
          forbidNonWhitelisted: true,
        }),
      });
    }

    return preloadedProviders;
  }

}
