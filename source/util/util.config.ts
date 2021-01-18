import { Injectable } from '@nestjs/common';
import { IsNotEmpty, IsString } from 'class-validator';

import { InjectSecret } from '../config/config.decorator';

@Injectable()
export class UtilConfig {

  @InjectSecret({
    json: true,
    default: [
      'at_hash',
      'aud',
      'authorization',
      'nonce',
      'pass',
      'password',
      'sub',
    ],
  })
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  public readonly UTIL_SENSITIVE_KEYS: string[];

}
