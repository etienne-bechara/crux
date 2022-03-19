import { IsIn, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

import { Config, InjectSecret } from '../config/config.decorator';
import { LoggerSeverity } from '../logger/logger.enum';

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

  @InjectSecret()
  @IsOptional()
  @IsIn(Object.values(LoggerSeverity))
  public readonly SLACK_SEVERITY: LoggerSeverity;

  public readonly SLACK_EXCEPTION_MESSAGE = 'Failed to publish Slack message';

}
