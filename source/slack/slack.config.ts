import { IsIn, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

import { AppEnvironment } from '../app/app.enum';
import { Config, InjectSecret } from '../config/config.decorator';
import { LoggerLevel } from '../logger/logger.enum';

@Config()
export class SlackConfig {

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

  @InjectSecret({
    fallback: (environment) => {
      switch (environment) {
        case AppEnvironment.LOCAL: return null;
        case AppEnvironment.DEVELOPMENT: return LoggerLevel.WARNING;
        case AppEnvironment.STAGING: return LoggerLevel.WARNING;
        case AppEnvironment.PRODUCTION: return LoggerLevel.WARNING;
      }
    },
  })
  @IsOptional()
  @IsIn(Object.values(LoggerLevel))
  public readonly SLACK_LEVEL: LoggerLevel;

}
