import { Injectable } from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsArray, IsObject, IsUrl, ValidateIf, ValidateNested } from 'class-validator';

import { AppEnvironment } from '../../../app/app.enum';
import { InjectSecret } from '../../../config/config.decorator';
import { LoggerConfig } from '../../logger.config';
import { LoggerLevel } from '../../logger.enum';
import { LoggerTransportOptions } from '../../logger.interface';

@Injectable()
export class SentryConfig extends LoggerConfig {

  @InjectSecret()
  @IsUrl()
  @ValidateIf((o: SentryConfig) => {
    const envSetting = o.SENTRY_TRANSPORT_OPTIONS.find((s) => s.environment === o.NODE_ENV);
    return envSetting?.level ? true : false;
  })
  public readonly SENTRY_DSN: string;

  @InjectSecret({
    json: true,
    default: [
      { environment: AppEnvironment.LOCAL, level: null },
      { environment: AppEnvironment.DEVELOPMENT, level: LoggerLevel.ERROR },
      { environment: AppEnvironment.STAGING, level: LoggerLevel.ERROR },
      { environment: AppEnvironment.PRODUCTION, level: LoggerLevel.ERROR },
    ],
  })
  @ValidateNested({ each: true })
  @Type(() => LoggerTransportOptions)
  @IsArray()
  @IsObject({ each: true })
  public readonly SENTRY_TRANSPORT_OPTIONS: LoggerTransportOptions[] ;

}
