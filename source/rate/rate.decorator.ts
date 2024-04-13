import { SetMetadata } from '@nestjs/common';

import { AppMetadataKey } from '../app/app.enum';

/**
 * Attributes the endpoint a rate limit per minute and per IP,
 * which is shared among the whole application.
 * @param limit
 */
export function RateLimit(limit: number): MethodDecorator {
  return SetMetadata(AppMetadataKey.RATE_LIMIT, limit);
}
