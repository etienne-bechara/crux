import { Module } from '@nestjs/common';

import { HttpModule } from '../http/http.module';
import { LoggerModule } from '../logger/logger.module';
import { SlackConfig } from './slack.config';
import { SlackService } from './slack.service';

@Module({
  imports: [
    HttpModule.registerAsync({
      inject: [ SlackConfig ],
      useFactory: (slackConfig: SlackConfig) => ({
        name: 'SlackModule',
        silent: true,
        prefixUrl: slackConfig.SLACK_WEBHOOK,
      }),
    }),
    LoggerModule,
  ],
  providers: [
    SlackConfig,
    SlackService,
  ],
  exports: [
    SlackConfig,
  ],
})
export class SlackModule { }
