import { Injectable } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { Transform } from 'class-transformer';
import { IsIn, Max, Min } from 'class-validator';

import { InjectSecret } from '../config/config.decorator';
import { AppEnvironment } from './app.enum';

@Injectable()
export class AppConfig {

  @InjectSecret()
  @IsIn(Object.values(AppEnvironment))
  public readonly NODE_ENV: AppEnvironment;

  @InjectSecret({ default: 8080 })
  @Transform((v) => Number.parseInt(v))
  @Min(1024) @Max(65535)
  public readonly APP_PORT: number;

  public readonly APP_GLOBAL_PREFIX = '';

  public readonly APP_JSON_LIMIT = '10mb';

  public readonly APP_TIMEOUT = 90 * 1000;

  public readonly APP_CORS_OPTIONS: CorsOptions = {
    origin: '*',
    methods: 'DELETE, GET, OPTIONS, POST, PUT',
    allowedHeaders: 'Accept, Authorization, Content-Type',
  };

}
