import { HttpModule, Module } from '@bechara/crux';

import { ZipConfig } from './zip.config';
import { ZipController } from './zip.controller';
import { ZipService } from './zip.service';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ ZipModule ],
      inject: [ ZipConfig ],
      useFactory: (zipConfig: ZipConfig) => ({
        baseUrl: zipConfig.ZIP_HOST,
        cacheTtl: 60_000,
      }),
    }),
  ],
  controllers: [
    ZipController,
  ],
  providers: [
    ZipConfig,
    ZipService,
  ],
  exports: [
    ZipConfig,
    ZipService,
  ],
})
export class ZipModule { }
