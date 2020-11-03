import { DynamicModule, Module } from '@nestjs/common';
import { v4 } from 'uuid';

import { HttpsConfig } from './https.config';
import { HttpsInjectionToken } from './https.enum/https.injection.token';
import { HttpsAsyncModuleOptions, HttpsModuleOptions } from './https.interface';
import { HttpsService } from './https.service';

@Module({
  providers: [
    HttpsConfig,
    HttpsService,
    {
      provide: HttpsInjectionToken.MODULE_OPTIONS,
      useValue: { },
    },
  ],
  exports: [
    HttpsService,
    HttpsInjectionToken.MODULE_OPTIONS,
  ],
})
export class HttpsModule {

  /**
   * Configures the underlying https service synchronously.
   * @param options
   */
  public static register(options: HttpsModuleOptions = { }): DynamicModule {
    return {
      module: HttpsModule,
      providers: [
        {
          provide: HttpsInjectionToken.MODULE_ID,
          useValue: v4(),
        },
        {
          provide: HttpsInjectionToken.MODULE_OPTIONS,
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
  public static registerAsync(options: HttpsAsyncModuleOptions = { }): DynamicModule {
    return {
      module: HttpsModule,
      imports: options.imports,
      providers: [
        {
          provide: HttpsInjectionToken.MODULE_ID,
          useValue: v4(),
        },
        {
          provide: HttpsInjectionToken.MODULE_OPTIONS,
          inject: options.inject,
          useFactory: options.useFactory,
        },
      ],
    };
  }

}
