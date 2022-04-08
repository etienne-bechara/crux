import { IsIn, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

import { Config, InjectConfig } from '../config/config.decorator';
import { LogSeverity } from '../log/log.enum';

@Config()
export class SlackConfig {

  @InjectConfig()
  @IsOptional()
  @IsUrl()
  public readonly SLACK_WEBHOOK: string;

  @InjectConfig()
  @IsOptional()
  @IsString() @IsNotEmpty()
  public readonly SLACK_CHANNEL: string;

  @InjectConfig()
  @IsOptional()
  @IsString() @IsNotEmpty()
  public readonly SLACK_USERNAME: string;

  @InjectConfig()
  @IsOptional()
  @IsUrl()
  public readonly SLACK_ICON_URL: string;

  @InjectConfig()
  @IsOptional()
  @IsIn(Object.values(LogSeverity))
  public readonly SLACK_SEVERITY: LogSeverity;

}
