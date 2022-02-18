import { Injectable } from '@nestjs/common';

import { LoggerService } from '../logger/logger.service';
import { AsyncResolveParams, AsyncRetryParams } from './async.interface';

@Injectable()
export class AsyncService {

  public constructor(
    private readonly loggerService: LoggerService,
  ) { }

  /**
   * Asynchronously wait for desired amount of milliseconds.
   * @param time
   */
  public async sleep(time: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, time));
  }

  /**
   * Wait for target promise resolution withing desired timeout.
   * On failure throw a timeout exception.
   * @param promise
   * @param timeout
   */
  public async resolveOrTimeout<T>(promise: Promise<T>, timeout: number): Promise<T> {
    this.loggerService.debug(`[AsyncService] Resolving promise with ${timeout / 1000}s timeout...`);

    const result = await Promise.race([
      promise,
      new Promise((reject) => setTimeout(() => reject('timed out'), timeout)),
    ]);

    if (result === 'timed out') {
      throw new Error(`async resolution timed out after ${timeout / 1000}s`);
    }

    this.loggerService.debug('[AsyncService] Promise resolved sucessfully within timeout');
    return result as T;
  }

  /**
   * Runs multiple promises limiting concurrency.
   * @param params
   */
  public async resolveLimited<I, O>(params: AsyncResolveParams<I, O>): Promise<Awaited<O>[]> {
    const { data, limit, method } = params;
    const resolved: Promise<O>[] = [ ];
    const executing = [ ];

    this.loggerService.debug(`[AsyncService] Resolving promises with ${limit} concurrency limit...`);

    for (const item of data) {
      // eslint-disable-next-line promise/prefer-await-to-then
      const p = Promise.resolve().then(() => method(item));
      resolved.push(p);

      if (limit <= data.length) {
        // eslint-disable-next-line promise/prefer-await-to-then
        const e = p.then(() => executing.splice(executing.indexOf(e), 1));
        executing.push(e);

        if (executing.length >= limit) {
          await Promise.race(executing);
        }
      }
    }

    const allResolved = await Promise.all(resolved);

    this.loggerService.debug(`[AsyncService] Promises resolved successfully with ${limit} concurrency limit`);
    return allResolved;
  }

  /**
   * Retry a method for configured times or until desired timeout.
   * @param params
   */
  // eslint-disable-next-line complexity
  public async retryOnException<T>(params: AsyncRetryParams<T>): Promise<T> {
    const txtName = `${params.name || 'retryOnException()'}`;
    const txtPrefix = `[AsyncService] ${txtName}:`;
    const txtRetry = params.retries || params.retries === 0 ? params.retries : '∞';
    const txtTimeout = params.timeout ? params.timeout / 1000 : '∞ ';
    const msgStart = `${txtPrefix} running with ${txtRetry} retries and ${txtTimeout}s timeout...`;
    const startTime = Date.now();
    let tentative = 1;
    let result: T;

    this.loggerService.debug(msgStart);

    // eslint-disable-next-line no-constant-condition
    while (true) {
      try {
        const elapsed = Date.now() - startTime;

        result = params.timeout
          ? await this.resolveOrTimeout(params.method(), params.timeout - elapsed)
          : await params.method();

        break;
      }
      catch (e) {
        const elapsed = Date.now() - startTime;

        if (
          (params.retries || params.retries === 0) && tentative > params.retries
          || params.timeout && elapsed > params.timeout
          || params.breakIf?.(e)
        ) {
          if (e?.message?.startsWith('async resolution timed out')) {
            e.message = `${txtName} timed out after ${params.timeout / 1000}s`;
          }

          throw e;
        }

        tentative++;

        const txtElapsed = `${elapsed / 1000}/${txtTimeout}`;
        const msgRetry = `${txtPrefix} ${e.message} | Retry #${tentative}/${txtRetry}, elapsed ${txtElapsed}s...`;

        this.loggerService.debug(msgRetry);

        await this.sleep(params.delay || 0);
      }
    }

    this.loggerService.debug(`${txtPrefix} finished successfully!`);
    return result;
  }

}
