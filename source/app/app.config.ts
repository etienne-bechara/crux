import { HttpStatus, Injectable } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { IsIn, IsNumber, IsString, Max, Min } from 'class-validator';

import { InjectSecret } from '../config/config.decorator';
import { ToNumber } from '../transform/transform.decorator';
import { AppEnvironment } from './app.enum';

@Injectable()
export class AppConfig {

  @InjectSecret()
  @IsIn(Object.values(AppEnvironment))
  public readonly NODE_ENV: AppEnvironment;

  @InjectSecret({ baseValue: '8080' })
  @ToNumber()
  @IsNumber() @Min(1024) @Max(65_535)
  public readonly APP_PORT: number;

  @InjectSecret({ baseValue: '0.0.0.0' })
  @IsString()
  public readonly APP_HOSTNAME: string;

  @InjectSecret({ baseValue: '' })
  @IsString()
  public readonly APP_GLOBAL_PREFIX: string;

  @InjectSecret({ baseValue: '60000' })
  @ToNumber()
  @IsNumber()
  public readonly APP_TIMEOUT: number;

  public readonly APP_CORS_OPTIONS: CorsOptions = {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  };

  public readonly APP_FILTER_HTTP_ERRORS: HttpStatus[] = [
    HttpStatus.INTERNAL_SERVER_ERROR,
  ];

}
