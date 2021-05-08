import { Injectable } from '@nestjs/common';

@Injectable()
export class HttpConfig {

  // 1 minute
  public readonly HTTP_DEFAULT_TIMEOUT = 1 * 60 * 1000;

  // 15 minutes
  public readonly HTTP_DEFAULT_CACHE_MAX_AGE = 15 * 60 * 1000;

  // 10.000 cached requests (per instance)
  public readonly HTTP_DEFAULT_CACHE_LIMIT = 10000;

}
