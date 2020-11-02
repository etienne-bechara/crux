import { DynamicModule, Module } from '@nestjs/common';
import { v4 } from 'uuid';

import { HttpsConfig } from './https.config';
import { HttpsAsyncModuleOptions, HttpsModuleOptions } from './https.interface';
import { HttpsService } from './https.service';

@Module({
  providers: [
    HttpsConfig,
    HttpsService,
    {
      provide: HttpsConfig.HTTPS_MODULE_OPTIONS_TOKEN,
      useValue: { },
    },
  ],
  exports: [
    HttpsService,
    HttpsConfig.HTTPS_MODULE_OPTIONS_TOKEN,
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
          provide: HttpsConfig.HTTPS_MODULE_ID_TOKEN,
          useValue: v4(),
        },
        {
          provide: HttpsConfig.HTTPS_MODULE_OPTIONS_TOKEN,
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
          provide: HttpsConfig.HTTPS_MODULE_ID_TOKEN,
          useValue: v4(),
        },
        {
          provide: HttpsConfig.HTTPS_MODULE_OPTIONS_TOKEN,
          inject: options.inject,
          useFactory: options.useFactory,
        },
      ],
    };
  }

}
