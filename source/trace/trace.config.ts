import { Config, InjectConfig } from '../config/config.decorator';
import { IsNotEmpty, IsOptional, IsString, IsUrl } from '../validate/validate.decorator';
import { TraceOptions } from './trace.interface';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const TRACE_DEFAULT_OPTIONS: TraceOptions = {
  pushInterval: 60_000,
  batchSize: 1000,
};

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
