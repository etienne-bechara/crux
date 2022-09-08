import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

import { Config, InjectConfig } from '../config/config.decorator';
import { ToNumber } from '../transform/transform.decorator';

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
