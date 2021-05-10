import { HttpStatus, Injectable } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { Transform } from 'class-transformer';
import { IsIn, IsNumber, IsString, Max, Min } from 'class-validator';

import { InjectSecret } from '../config/config.decorator';
import { AppEnvironment } from './app.enum';
import { AppBootOptions } from './app.interface';

@Injectable()
export class AppConfig {

  @InjectSecret()
  @IsIn(Object.values(AppEnvironment))
  public readonly NODE_ENV: AppEnvironment;

  @InjectSecret({ default: 8080 })
  @Transform((o) => Number.parseInt(o.value))
  @IsNumber() @Min(1024) @Max(65_535)
  public readonly APP_PORT: number;

  @InjectSecret({ default: '' })
  @IsString()
  public readonly APP_GLOBAL_PREFIX: string;

  public readonly APP_BOOT_OPTIONS: AppBootOptions = { };

  public readonly APP_DEFAULT_TIMEOUT = 60 * 1000;

  public readonly APP_DEFAULT_JSON_LIMIT= '10MB';

  public readonly APP_DEFAULT_CORS_OPTIONS: CorsOptions = {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  };

  public readonly APP_DEFAULT_HTTP_ERRORS: HttpStatus[] = [
    HttpStatus.INTERNAL_SERVER_ERROR,
  ];

}
