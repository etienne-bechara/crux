import { Injectable } from '@nestjs/common';

@Injectable()
export class UtilConfig {

  public readonly UTIL_SENSITIVE_KEYS = [
    'at_hash',
    'aud',
    'authorization',
    'nonce',
    'pass',
    'password',
    'sub',
  ];

}
