import { Module } from '@nestjs/common';

import { AppConfig } from '../app/app.config';
import { HttpModule } from '../http/http.module';
import { LokiConfig } from './loki.config';
import { LokiService } from './loki.service';

@Module({
  imports: [
    HttpModule.registerAsync({
      inject: [ AppConfig, LokiConfig ],
      useFactory: (appConfig: AppConfig, lokiConfig: LokiConfig) => ({
        name: 'LokiModule',
        silent: true,
        prefixUrl: lokiConfig.LOKI_URL || appConfig.APP_OPTIONS.logger?.lokiUrl,
        username: lokiConfig.LOKI_USERNAME ?? appConfig.APP_OPTIONS.logger?.lokiUsername,
        password: lokiConfig.LOKI_PASSWORD ?? appConfig.APP_OPTIONS.logger?.lokiPassword,
      }),
    }),
  ],
  providers: [
    LokiConfig,
    LokiService,
  ],
  exports: [
    LokiConfig,
    LokiService,
  ],
})
export class LokiModule { }
