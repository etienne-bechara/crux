import { ContextService } from '../context/context.service';

export interface RateLimitOptions {
	/**
	 * Rate limit.
	 * Default: `60000` (1min).
	 */
	limit: number | ((contextService: ContextService) => number);
	/**
	 * Rate limiting key.
	 * Default: `contextService.getRequestIp()`.
	 */
	key?: string | ((contextService: ContextService) => string);
	/**
	 * Rate limiting window in milliseconds.
	 * Default: `60000` (1min).
	 */
	window?: number | ((contextService: ContextService) => number);
}
