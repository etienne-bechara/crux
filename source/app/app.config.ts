import { Injectable } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsIn, IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';

import { InjectSecret } from '../config/config.decorator';
import { AppEnvironment } from './app.enum';
@Injectable()
export class AppConfig {

  @InjectSecret()
  @IsIn(Object.values(AppEnvironment))
  public readonly NODE_ENV: AppEnvironment;

  @InjectSecret({ default: 8080 })
  @Transform((o) => Number.parseInt(o.value))
  @IsNumber() @Min(1024) @Max(65535)
  public readonly APP_PORT: number;

  @InjectSecret({ default: 90 * 1000 })
  @Transform((o) => Number.parseInt(o.value))
  @IsNumber() @Min(1000)
  public readonly APP_TIMEOUT: number;

  @InjectSecret({ default: '' })
  @IsString()
  public readonly APP_GLOBAL_PREFIX: string;

  @InjectSecret({ default: '10mb' })
  @IsString() @IsNotEmpty()
  public readonly APP_JSON_LIMIT: string;

  @InjectSecret({ default: '*' })
  @IsString() @IsNotEmpty()
  public readonly APP_CORS_ORIGIN: string;

  @InjectSecret({ default: 'GET,HEAD,PUT,PATCH,POST,DELETE' })
  @IsString() @IsNotEmpty()
  public readonly APP_CORS_METHODS: string;

}
