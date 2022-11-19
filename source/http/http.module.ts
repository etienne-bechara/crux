import { DynamicModule, Global, Module } from '@nestjs/common';
import crypto from 'crypto';

import { HttpInjectionToken } from './http.enum';
import { HttpAsyncModuleOptions, HttpModuleOptions } from './http.interface';
import { HttpService } from './http.service';

@Global()
@Module({
  providers: [
    HttpService,
    {
      provide: HttpInjectionToken.HTTP_MODULE_OPTIONS,
      useValue: { },
    },
  ],
  exports: [
    HttpService,
    HttpInjectionToken.HTTP_MODULE_OPTIONS,
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
          provide: HttpInjectionToken.HTTP_MODULE_ID,
          useValue: crypto.randomBytes(8).toString('hex'),
        },
        {
          provide: HttpInjectionToken.HTTP_MODULE_OPTIONS,
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
          provide: HttpInjectionToken.HTTP_MODULE_ID,
          useValue: crypto.randomBytes(8).toString('hex'),
        },
        {
          provide: HttpInjectionToken.HTTP_MODULE_OPTIONS,
          inject: options.inject,
          useFactory: options.useFactory,
        },
      ],
    };
  }

}
