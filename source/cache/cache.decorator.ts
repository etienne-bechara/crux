import { applyDecorators, SetMetadata, UseInterceptors } from '@nestjs/common';

import { AppMetadataKey } from '../app/app.enum';
import { CacheInterceptor } from './cache.interceptor';
import { CacheRouteOptions } from './cache.interface';

/**
 * Enables inbound caching for target method.
 * @param options
 */
export function Cache<T>(options: CacheRouteOptions<T> = { }): any {
  return applyDecorators(
    SetMetadata(AppMetadataKey.CACHE_OPTIONS, options),
    UseInterceptors(CacheInterceptor),
  );
}
