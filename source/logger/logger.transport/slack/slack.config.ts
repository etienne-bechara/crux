import { Injectable } from '@nestjs/common';
import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

import { AppEnvironment } from '../../../app/app.enum';
import { InjectSecret } from '../../../config/config.decorator';
import { LoggerConfig } from '../../logger.config';
import { LoggerLevel } from '../../logger.enum';
import { LoggerTransportOptions } from '../../logger.interface';

@Injectable()
export class SlackConfig extends LoggerConfig {

  @InjectSecret()
  @IsOptional()
  @IsUrl()
  public readonly SLACK_WEBHOOK: string;

  @InjectSecret()
  @IsOptional()
  @IsString() @IsNotEmpty()
  public readonly SLACK_CHANNEL: string;

  @InjectSecret()
  @IsOptional()
  @IsString() @IsNotEmpty()
  public readonly SLACK_USERNAME: string;

  @InjectSecret()
  @IsOptional()
  @IsUrl()
  public readonly SLACK_ICON_URL: string;

  public readonly SLACK_TRANSPORT_OPTIONS: LoggerTransportOptions[] = [
    { environment: AppEnvironment.LOCAL, level: null },
    { environment: AppEnvironment.DEVELOPMENT, level: LoggerLevel.WARNING },
    { environment: AppEnvironment.STAGING, level: LoggerLevel.WARNING },
    { environment: AppEnvironment.PRODUCTION, level: LoggerLevel.WARNING },
  ];

}
