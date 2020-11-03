import { Module } from '@nestjs/common';

import { LoggerModule } from '../../logger.module';
import { SentryConfig } from './sentry.config';
import { SentryService } from './sentry.service';

@Module({
  imports: [
    LoggerModule,
  ],
  providers: [
    SentryConfig,
    SentryService,
  ],
})
export class SentryModule { }
