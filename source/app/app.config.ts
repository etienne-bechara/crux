import { Injectable } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { Transform, Type } from 'class-transformer';
import { IsIn, IsNumber, IsObject, IsString, Max, Min, ValidateNested } from 'class-validator';

import { InjectSecret } from '../config/config.decorator';
import { AppEnvironment } from './app.enum';
import { AppCorsOptions } from './app.interface';

@Injectable()
export class AppConfig {

  @InjectSecret()
  @IsIn(Object.values(AppEnvironment))
  public readonly NODE_ENV: AppEnvironment;

  @InjectSecret({ default: 8080 })
  @Transform((v) => Number.parseInt(v))
  @Min(1024) @Max(65535)
  public readonly APP_PORT: number;

  @InjectSecret({ default: '' })
  @IsString()
  public readonly APP_GLOBAL_PREFIX: string;

  @InjectSecret({ default: '10mb' })
  @IsString()
  public readonly APP_JSON_LIMIT: string;

  @InjectSecret({ default: 90 * 1000 })
  @IsNumber()
  public readonly APP_TIMEOUT: number;

  @InjectSecret({
    json: true,
    default: {
      origin: '*',
      methods: 'DELETE, GET, OPTIONS, POST, PUT',
      allowedHeaders: 'Accept, Authorization, Content-Type',
    },
  })
  @ValidateNested()
  @Type(() => AppCorsOptions)
  @IsObject()
  public readonly APP_CORS_OPTIONS: CorsOptions;

}
