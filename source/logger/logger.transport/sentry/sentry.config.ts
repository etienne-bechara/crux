import { Injectable } from '@nestjs/common';
import { IsUrl, ValidateIf } from 'class-validator';

import { AppEnvironment } from '../../../app/app.enum';
import { InjectSecret } from '../../../config/config.decorator';
import { LoggerConfig } from '../../logger.config';
import { LoggerLevel } from '../../logger.enum';

@Injectable()
export class SentryConfig extends LoggerConfig {

  @InjectSecret()
  @IsUrl()
  @ValidateIf((o: SentryConfig) => {
    const envSetting = o.SENTRY_TRANSPORT_OPTIONS.find((s) => s.environment === o.NODE_ENV);
    return envSetting?.level ? true : false;
  })
  public readonly SENTRY_DSN: string;

  public readonly SENTRY_TRANSPORT_OPTIONS = [
    { environment: AppEnvironment.LOCAL, level: null },
    { environment: AppEnvironment.DEVELOPMENT, level: LoggerLevel.ERROR },
    { environment: AppEnvironment.STAGING, level: LoggerLevel.ERROR },
    { environment: AppEnvironment.PRODUCTION, level: LoggerLevel.ERROR },
  ];

}
