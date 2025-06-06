import { randomUUID } from 'node:crypto';
import { setTimeout as sleep } from 'node:timers/promises';
import { Inject, Injectable, InternalServerErrorException, forwardRef } from '@nestjs/common';

import { AppConfig } from '../app/app.config';
import { CacheService } from '../cache/cache.service';
import { LogService } from '../log/log.service';
import {
	PromiseResolveDedupedParams,
	PromiseResolveInBatchesParams,
	PromiseResolveLimitedParams,
	PromiseResolveOrTimeoutParams,
	PromiseRetryParams,
} from './promise.interface';

@Injectable()
export class PromiseService {
	public constructor(
		private readonly appConfig: AppConfig,
		@Inject(forwardRef(() => CacheService))
		private readonly cacheService: CacheService,
		private readonly logService: LogService,
	) {}

	/**
	 * Wait for target promise resolution withing desired timeout.
	 * On failure throw a timeout exception.
	 * @param params
	 */
	public async resolveOrTimeout<T>(params: PromiseResolveOrTimeoutParams<T>): Promise<T> {
		const { promise, timeout: paramsTimeout, timeoutMessage } = params;
		const timeout = paramsTimeout ?? this.appConfig.APP_OPTIONS.timeout * 0.95;

		this.logService.debug(`Resolving promise with ${timeout / 1000}s timeout`);

		const result = await Promise.race([
			promise(),
			new Promise((reject) => setTimeout(() => reject('timed out'), timeout)),
		]);

		if (result === 'timed out') {
			const errorMessage = timeoutMessage || `promise resolution timed out after ${timeout / 1000}s`;
			throw new InternalServerErrorException(errorMessage);
		}

		this.logService.debug('Promise resolved successfully within timeout');
		return result as T;
	}

	/**
	 * Runs multiple promises limiting concurrency.
	 * @param params
	 */
	public async resolveLimited<I, O>(params: PromiseResolveLimitedParams<I, O>): Promise<Awaited<O>[]> {
		const { data, limit, promise: method } = params;
		const resolved: Promise<O>[] = [];
		const executing: Promise<any>[] = [];

		this.logService.debug(`Resolving promises with ${limit} concurrency limit`);

		for (const item of data) {
			const p = Promise.resolve().then(() => method(item));
			resolved.push(p);

			if (limit <= data.length) {
				const e: Promise<any> = p.then(() => executing.splice(executing.indexOf(e), 1));
				executing.push(e);

				if (executing.length >= limit) {
					await Promise.race(executing);
				}
			}
		}

		const allResolved = await Promise.all(resolved);

		this.logService.debug(`Promises resolved successfully with ${limit} concurrency limit`);
		return allResolved;
	}

	/**
	 * Runs underlying operation in multiple batches,
	 * controlling size and concurrency.
	 * @param params
	 */
	public async resolveInBatches<I, O>(params: PromiseResolveInBatchesParams<I, O>): Promise<O[]> {
		const { data, promise, size, limit } = params;
		const batches: I[][] = [];

		this.logService.debug(`Resolving promises in ${Math.ceil(data.length / size)} batches`);

		for (let i = 0; i < data.length; i += size) {
			batches.push(data.slice(i, i + size));
		}

		const result = await this.resolveLimited({
			data: batches,
			promise: (d) => promise(d),
			limit,
		});

		this.logService.debug(`Promises resolved successfully in ${Math.ceil(data.length / size)} batches`);
		return result.flat();
	}

	/**
	 * Runs underlying promise ensuring that the same instance of it
	 * does not run concurrently. In the event of a duplication, the
	 * duplicated waits for original resolution and share its output.
	 * @param params
	 */
	public async resolveDeduped<T>(params: PromiseResolveDedupedParams<T>): Promise<T> {
		const { key, timeout: paramsTimeout, timeoutMessage, ttl: paramsTtl, delay: paramsDelay, promise } = params;

		const timeout = paramsTimeout ?? this.appConfig.APP_OPTIONS.timeout * 0.95;
		const ttl = paramsTtl ?? 60 * 1000;
		const delay = paramsDelay ?? 1000;

		this.logService.debug(`Deduplicating ${key} promise with ${timeout / 1000}s timeout and ${ttl / 1000}s TTL`);

		const provider = this.cacheService.getProvider();
		const providerId = randomUUID();
		const providerKey = `dedupe:${key}:provider`;
		const dataKey = `dedupe:${key}:data`;
		const dataErrorMessage = 'DEDUPE_FAILED';

		await provider.set(providerKey, providerId, { ttl, skip: 'IF_EXIST' });
		const keyValue = await provider.get(providerKey);

		let data: T;

		if (keyValue === providerId) {
			try {
				data = await promise();
			} catch (e) {
				await Promise.all([provider.set(dataKey, dataErrorMessage, { ttl }), provider.del(providerKey)]);

				throw e;
			}

			await provider.set(dataKey, data, { ttl });
			this.logService.debug(`Promise ${key} resolved successfully with source data`);
		} else {
			data = await this.resolveOrTimeout({
				timeout,
				timeoutMessage,
				promise: async () => {
					let res: T | undefined;

					while (!res) {
						res = await provider.get(dataKey);
						await sleep(delay);
					}

					return res;
				},
			});

			if (data === dataErrorMessage) {
				return this.resolveDeduped(params);
			}

			this.logService.debug(`Promise ${key} resolved successfully with cached data`);
		}

		return data;
	}

	/**
	 * Retry a method for configured times or until desired timeout.
	 * @param params
	 */
	public async retryOnRejection<T>(params: PromiseRetryParams<T>): Promise<T> {
		const { name, retries, timeout, promise, breakIf, delay } = params;
		const start = Date.now();

		const txtPrefix = `${name || 'retryOnException()'}`;
		const txtRetry = retries || retries === 0 ? retries : '∞';
		const txtTimeout = timeout ? timeout / 1000 : '∞ ';

		const msgStart = `${txtPrefix} running with ${txtRetry} retries and ${txtTimeout}s timeout`;
		this.logService.debug(msgStart);

		let tentative = 1;
		let result: T;

		while (true) {
			try {
				const elapsed = Date.now() - start;

				result = timeout ? await this.resolveOrTimeout({ promise, timeout: timeout - elapsed }) : await promise();

				break;
			} catch (e) {
				const error = e as Error;
				const elapsed = Date.now() - start;

				if (((retries || retries === 0) && tentative > retries) || (timeout && elapsed > timeout) || breakIf?.(error)) {
					if (error?.message?.startsWith('promise resolution timed out')) {
						error.message = `${txtPrefix} timed out after ${(timeout || 0) / 1000}s`;
					}

					throw error;
				}

				tentative++;

				const txtElapsed = `${elapsed / 1000}/${txtTimeout}`;
				const msgRetry = `${txtPrefix} ${error.message} | Attempt #${tentative}/${txtRetry} | Elapsed ${txtElapsed}s`;
				this.logService.debug(msgRetry);

				await sleep(delay || 0);
			}
		}

		this.logService.debug(`${txtPrefix} finished successfully`);
		return result;
	}
}
