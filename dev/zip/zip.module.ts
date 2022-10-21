import { HttpModule, Module } from '../../source/override';
import { ZipConfig } from './zip.config';
import { ZipController } from './zip.controller';
import { ZipService } from './zip.service';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ ZipModule ],
      inject: [ ZipConfig ],
      useFactory: (zipConfig: ZipConfig) => ({
        name: 'ZipModule',
        prefixUrl: zipConfig.ZIP_HOST,
        resolveBodyOnly: true,
        responseType: 'json',
        cacheTtl: 10_000,
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
