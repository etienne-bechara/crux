import { Module } from '@nestjs/common';

import { AppConfig } from '../app/app.config';
import { HttpModule } from '../http/http.module';
import { SlackConfig } from './slack.config';
import { SlackService } from './slack.service';

@Module({
  imports: [
    HttpModule.registerAsync({
      inject: [ AppConfig, SlackConfig ],
      useFactory: (appConfig: AppConfig, slackConfig: SlackConfig) => ({
        name: 'SlackModule',
        silent: true,
        prefixUrl: slackConfig.SLACK_WEBHOOK || appConfig.APP_OPTIONS.logger?.slackWebhook,
        json: {
          channel: slackConfig.SLACK_CHANNEL || appConfig.APP_OPTIONS.logger?.slackChannel,
          username: slackConfig.SLACK_USERNAME || appConfig.APP_OPTIONS.logger?.slackUsername,
          icon_url: slackConfig.SLACK_ICON_URL || appConfig.APP_OPTIONS.logger?.slackIconUrl,
        },
      }),
    }),
  ],
  providers: [
    SlackConfig,
    SlackService,
  ],
  exports: [
    SlackConfig,
    SlackService,
  ],
})
export class SlackModule { }
