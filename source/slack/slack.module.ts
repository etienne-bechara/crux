import { Module } from '@nestjs/common';

import { HttpModule } from '../http/http.module';
import { SlackConfig } from './slack.config';
import { SlackService } from './slack.service';

@Module({
  imports: [
    HttpModule.register({
      name: 'SlackModule',
      silent: true,
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
