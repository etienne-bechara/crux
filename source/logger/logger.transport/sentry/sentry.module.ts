import { Module } from '@nestjs/common';

import { SentryConfig } from './sentry.config';
import { SentryService } from './sentry.service';

@Module({
  providers: [ SentryConfig, SentryService ],
})
export class SentryModule { }
