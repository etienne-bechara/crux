import { Injectable } from '@nestjs/common';
import { IsNumber } from 'class-validator';

import { InjectSecret } from '../config/config.decorator';

@Injectable()
export class HttpsConfig {

  @InjectSecret({ default: 60 * 1000 })
  @IsNumber()
  public readonly HTTPS_DEFAULT_TIMEOUT: number;

}
