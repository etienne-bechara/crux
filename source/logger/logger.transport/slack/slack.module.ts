import { Module } from '@nestjs/common';

import { HttpsModule } from '../../../https/https.module';
import { LoggerModule } from '../../logger.module';
import { SlackConfig } from './slack.config';
import { SlackService } from './slack.service';

@Module({
  imports: [
    HttpsModule.registerAsync({
      inject: [ SlackConfig ],
      useFactory: (slackConfig: SlackConfig) => ({
        name: 'SlackModule',
        bases: {
          url: slackConfig.SLACK_WEBHOOK,
        },
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
