import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

import { Config, InjectConfig } from '../config/config.decorator';

@Config()
export class TraceConfig {

  @InjectConfig()
  @IsOptional()
  @IsUrl()
  public readonly TRACE_URL: string;

  @InjectConfig()
  @IsOptional()
  @IsString() @IsNotEmpty()
  public readonly TRACE_USERNAME: string;

  @InjectConfig()
  @IsOptional()
  @IsString() @IsNotEmpty()
  public readonly TRACE_PASSWORD: string;

}
