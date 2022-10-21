import { Config, InjectConfig } from '../config/config.decorator';
import { ToNumber } from '../transform/transform.decorator';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from '../validate/validate.decorator';
import { CacheOptions } from './cache.interface';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const CACHE_DEFAULT_OPTIONS: CacheOptions = {
  defaultTimeout: 2000,
  defaultTtl: 60_000,
  bucketTtl: 30 * 24 * 60 * 60 * 1000,
};

@Config()
export class CacheConfig {

  @InjectConfig()
  @IsOptional()
  @IsString() @IsNotEmpty()
  public readonly CACHE_HOST: string;

  @InjectConfig()
  @IsOptional()
  @ToNumber()
  @IsNumber()
  public readonly CACHE_PORT: number;

  @InjectConfig()
  @IsOptional()
  @IsString() @IsNotEmpty()
  public readonly CACHE_USERNAME: string;

  @InjectConfig()
  @IsOptional()
  @IsString() @IsNotEmpty()
  public readonly CACHE_PASSWORD: string;

}
