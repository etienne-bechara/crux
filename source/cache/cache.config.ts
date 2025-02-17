import { Config, InjectConfig } from '../config/config.decorator';
import { ToNumber } from '../transform/transform.decorator';
import { IsNumber, IsOptional, IsString } from '../validate/validate.decorator';
import { CacheOptions } from './cache.interface';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const CACHE_DEFAULT_OPTIONS: CacheOptions = {
  defaultTimeout: 500,
  defaultTtl: 60_000,
  bucketTtl: 24 * 60 * 60 * 1000,
  failureThreshold: 3,
  failureTtl: 5000,
};

@Config()
export class CacheConfig {

  @InjectConfig()
  @IsOptional()
  @IsString()
  public readonly CACHE_HOST?: string;

  @InjectConfig()
  @IsOptional()
  @ToNumber()
  @IsNumber()
  public readonly CACHE_PORT?: number;

  @InjectConfig()
  @IsOptional()
  @IsString()
  public readonly CACHE_USERNAME?: string;

  @InjectConfig()
  @IsOptional()
  @IsString()
  public readonly CACHE_PASSWORD?: string;

}
