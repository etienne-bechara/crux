import { SetMetadata } from '@nestjs/common';

import { AppMetadataKey } from '../app/app.enum';
import { RateLimitOptions } from './rate.interface';

/**
 * Attributes the endpoint a rate limit per minute and per IP,
 * which is shared among the whole application.
 * @param options
 */
export function RateLimit(options: RateLimitOptions): MethodDecorator {
	return SetMetadata(AppMetadataKey.RATE_LIMIT_OPTIONS, options);
}
