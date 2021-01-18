import { Injectable } from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsObject, IsOptional,
  IsString, IsUrl, ValidateIf, ValidateNested } from 'class-validator';

import { AppEnvironment } from '../../../app/app.enum';
import { InjectSecret } from '../../../config/config.decorator';
import { LoggerConfig } from '../../logger.config';
import { LoggerLevel } from '../../logger.enum';
import { LoggerTransportOptions } from '../../logger.interface';

@Injectable()
export class SlackConfig extends LoggerConfig {

  @InjectSecret()
  @IsUrl()
  @ValidateIf((o: SlackConfig) => {
    const envSetting = o.SLACK_TRANSPORT_OPTIONS.find((s) => s.environment === o.NODE_ENV);
    return envSetting?.level ? true : false;
  })
  public readonly SLACK_WEBHOOK: string;

  @InjectSecret()
  @IsString() @IsNotEmpty()
  @ValidateIf((o: SlackConfig) => {
    const envSetting = o.SLACK_TRANSPORT_OPTIONS.find((s) => s.environment === o.NODE_ENV);
    return envSetting?.level ? true : false;
  })
  public readonly SLACK_CHANNEL: string;

  @InjectSecret()
  @IsOptional()
  @IsString() @IsNotEmpty()
  public readonly SLACK_USERNAME: string;

  @InjectSecret()
  @IsOptional()
  @IsUrl()
  public readonly SLACK_ICON_URL: string;

  @InjectSecret({
    json: true,
    default: [
      { environment: AppEnvironment.LOCAL, level: null },
      { environment: AppEnvironment.DEVELOPMENT, level: LoggerLevel.WARNING },
      { environment: AppEnvironment.STAGING, level: LoggerLevel.WARNING },
      { environment: AppEnvironment.PRODUCTION, level: LoggerLevel.WARNING },
    ],
  })
  @ValidateNested({ each: true })
  @Type(() => LoggerTransportOptions)
  @IsArray()
  @IsObject({ each: true })
  public readonly SLACK_TRANSPORT_OPTIONS: LoggerTransportOptions[] ;

}
