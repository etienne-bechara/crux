import { Injectable } from '@nestjs/common';
import { IsNumber } from 'class-validator';

import { InjectSecret } from '../config/config.decorator';

@Injectable()
export class HttpsConfig {

  // 1 minute
  @InjectSecret({ default: 1 * 60 * 1000 })
  @IsNumber()
  public readonly HTTPS_DEFAULT_TIMEOUT: number;

  // 15 minutes
  @InjectSecret({ default: 15 * 60 * 1000 })
  @IsNumber()
  public readonly HTTPS_DEFAULT_CACHE_MAX_AGE: number;

  // 10.000 cached requests (per instance)
  @InjectSecret({ default: 10000 })
  @IsNumber()
  public readonly HTTPS_DEFAULT_CACHE_LIMIT: number;

}
