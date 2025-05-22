import { HttpStatus } from '@nestjs/common';

import { HttpMethod } from './http.enum';
import { HttpOptions, HttpResponse } from './http.interface';

export const HTTP_DEFAULT_OPTIONS: HttpOptions = {
	timeout: 60 * 1000,
	parser: async (res: HttpResponse) => {
		const { headers } = res;
		const contentType = headers.get('content-type');

		if (contentType?.startsWith('application/json')) {
			return res.json();
		}
		if (contentType?.startsWith('text')) {
			return res.text();
		}
		const arrayBuffer = await res.arrayBuffer();
		return Buffer.from(arrayBuffer);
	},
	cacheTtl: 0,
	cacheTimeout: 500,
	cacheMethods: [HttpMethod.GET, HttpMethod.HEAD],
	retryLimit: 2,
	retryMethods: [
		HttpMethod.GET,
		HttpMethod.PUT,
		HttpMethod.HEAD,
		HttpMethod.DELETE,
		HttpMethod.OPTIONS,
		HttpMethod.TRACE,
	],
	retryCodes: [
		HttpStatus.REQUEST_TIMEOUT,
		HttpStatus.TOO_MANY_REQUESTS,
		HttpStatus.INTERNAL_SERVER_ERROR,
		HttpStatus.BAD_GATEWAY,
		HttpStatus.SERVICE_UNAVAILABLE,
		HttpStatus.GATEWAY_TIMEOUT,
	],
	retryDelay: (attempts: number): number => {
		return attempts > 4 ? 16_000 : 2 ** (attempts - 1) * 1000;
	},
};
