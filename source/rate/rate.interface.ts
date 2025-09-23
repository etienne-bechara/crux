import { ContextService } from '../context/context.service';

export interface RateLimitOptions {
	/**
	 * Rate limit.
	 */
	limit: number | ((contextService: ContextService) => number);
	/**
	 * Rate limiting key.
	 * Default: `${ip}:${method}:${path}`.
	 */
	key?: string | ((contextService: ContextService) => string);
	/**
	 * Rate limiting window in milliseconds.
	 * Default: `60000` (1min).
	 */
	window?: number | ((contextService: ContextService) => number);
}
