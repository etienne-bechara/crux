import { DynamicModule, Module } from '@nestjs/common';
import { v4 } from 'uuid';

import { LoggerModule } from '../logger/logger.module';
import { HttpConfig } from './http.config';
import { HttpInjectionToken } from './http.enum/http.injection.token';
import { HttpAsyncModuleOptions, HttpModuleOptions } from './http.interface';
import { HttpService } from './http.service';

@Module({
  imports: [
    LoggerModule,
  ],
  providers: [
    HttpConfig,
    HttpService,
    {
      provide: HttpInjectionToken.MODULE_OPTIONS,
      useValue: { },
    },
  ],
  exports: [
    HttpService,
    HttpInjectionToken.MODULE_OPTIONS,
  ],
})
export class HttpModule {

  /**
   * Configures the underlying https service synchronously.
   * @param options
   */
  public static register(options: HttpModuleOptions = { }): DynamicModule {
    return {
      module: HttpModule,
      providers: [
        {
          provide: HttpInjectionToken.MODULE_ID,
          useValue: v4(),
        },
        {
          provide: HttpInjectionToken.MODULE_OPTIONS,
          useValue: options,
        },
      ],
    };
  }

  /**
   * Configure the underlying service asynchronously which allows
   * acquiring data from other injectable services (i.e. Config).
   * @param options
   */
  public static registerAsync(options: HttpAsyncModuleOptions = { }): DynamicModule {
    return {
      module: HttpModule,
      imports: options.imports,
      providers: [
        {
          provide: HttpInjectionToken.MODULE_ID,
          useValue: v4(),
        },
        {
          provide: HttpInjectionToken.MODULE_OPTIONS,
          inject: options.inject,
          useFactory: options.useFactory,
        },
      ],
    };
  }

}
