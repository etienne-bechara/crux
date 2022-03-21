import { Injectable } from '@nestjs/common';

import { LogService } from '../log/log.service';
import { PromiseResolveParams, PromiseRetryParams } from './promise.interface';

@Injectable()
export class PromiseService {

  public constructor(
    private readonly logService: LogService,
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
    this.logService.debug(`Resolving promise with ${timeout / 1000}s timeout`);

    const result = await Promise.race([
      promise,
      new Promise((reject) => setTimeout(() => reject('timed out'), timeout)),
    ]);

    if (result === 'timed out') {
      throw new Error(`promise resolution timed out after ${timeout / 1000}s`);
    }

    this.logService.debug('Promise resolved successfully within timeout');
    return result as T;
  }

  /**
   * Runs multiple promises limiting concurrency.
   * @param params
   */
  public async resolveLimited<I, O>(params: PromiseResolveParams<I, O>): Promise<Awaited<O>[]> {
    const { data, limit, promise: method } = params;
    const resolved: Promise<O>[] = [ ];
    const executing = [ ];

    this.logService.debug(`Resolving promises with ${limit} concurrency limit`);

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

    this.logService.debug(`Promises resolved successfully with ${limit} concurrency limit`);
    return allResolved;
  }

  /**
   * Retry a method for configured times or until desired timeout.
   * @param params
   */
  // eslint-disable-next-line complexity
  public async retryOnRejection<T>(params: PromiseRetryParams<T>): Promise<T> {
    const txtName = `${params.name || 'retryOnException()'}`;
    const txtPrefix = `${txtName}:`;
    const txtRetry = params.retries || params.retries === 0 ? params.retries : '∞';
    const txtTimeout = params.timeout ? params.timeout / 1000 : '∞ ';
    const msgStart = `${txtPrefix} running with ${txtRetry} retries and ${txtTimeout}s timeout`;
    const startTime = Date.now();
    let tentative = 1;
    let result: T;

    this.logService.debug(msgStart);

    // eslint-disable-next-line no-constant-condition
    while (true) {
      try {
        const elapsed = Date.now() - startTime;

        result = params.timeout
          ? await this.resolveOrTimeout(params.promise(), params.timeout - elapsed)
          : await params.promise();

        break;
      }
      catch (e) {
        const elapsed = Date.now() - startTime;

        if (
          (params.retries || params.retries === 0) && tentative > params.retries
          || params.timeout && elapsed > params.timeout
          || params.breakIf?.(e)
        ) {
          if (e?.message?.startsWith('promise resolution timed out')) {
            e.message = `${txtName} timed out after ${params.timeout / 1000}s`;
          }

          throw e;
        }

        tentative++;

        const txtElapsed = `${elapsed / 1000}/${txtTimeout}`;
        const msgRetry = `${txtPrefix} ${e.message} | Retry #${tentative}/${txtRetry}, elapsed ${txtElapsed}s`;

        this.logService.debug(msgRetry);

        await this.sleep(params.delay || 0);
      }
    }

    this.logService.debug(`${txtPrefix} finished successfully`);
    return result;
  }

}
