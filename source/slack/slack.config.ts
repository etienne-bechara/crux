import { Config, InjectConfig } from '../config/config.decorator';
import { LogSeverity } from '../log/log.enum';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl } from '../validate/validate.decorator';
import { SlackOptions } from './slack.interface';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const SLACK_DEFAULT_OPTIONS: SlackOptions = {
  severity: LogSeverity.WARNING,
};

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
  @IsEnum(LogSeverity)
  public readonly SLACK_SEVERITY: LogSeverity;

}
