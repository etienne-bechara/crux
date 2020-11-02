
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
import { UtilModule } from '../util/util.module';
import { AppConfig } from './app.config';
import { AppFilter } from './app.filter';
import { AppLoggerInterceptor, AppTimeoutInterceptor } from './app.interceptor';
import { AppBootOptions } from './app.interface/app.boot.options';
import { AppMiddleware } from './app.middleware';

@Global()
@Module({
  providers: [
    AppConfig,
    { provide: APP_FILTER, useClass: AppFilter },
    { provide: APP_INTERCEPTOR, useClass: ClassSerializerInterceptor },
    { provide: APP_INTERCEPTOR, useClass: AppLoggerInterceptor },
    { provide: APP_INTERCEPTOR, useClass: AppTimeoutInterceptor },
    {
      provide: APP_PIPE,
      useFactory: (): ValidationPipe => new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    },
  ],
})
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
    const defaultConfigs = [
      AppConfig,
      HttpsConfig,
      LoggerConfig,
      ConsoleConfig,
      SentryConfig,
      ...UtilModule.globRequire([
        's*rc*/**/*.config.{js,ts}',
        '!**/*test*',
      ]),
    ];

    const defaultModules = [
      LoggerModule,
      ConsoleModule,
      SentryModule,
      UtilModule,
      ...UtilModule.globRequire([
        's*rc*/**/*.module.{js,ts}',
        '!**/*test*',
      ]),
    ];

    const defaultImports = [
      ConfigModule.registerAsync({
        envPath: options.envPath,
        configs: options.configs || defaultConfigs,
      }),
      ...defaultModules,
    ];

    const defaultExports = [
      ConfigModule,
      ...defaultModules,
    ];

    return {
      module: AppModule,
      imports: options.imports || defaultImports,
      exports: options.exports || defaultExports,
    };
  }

}
