import { Injectable } from '@nestjs/common';
import os from 'os';

import { HttpService } from '../http/http.service';
import { LoggerService } from '../logger/logger.service';
import { UtilAppStatus } from './util.interface';
import { UtilRetryParams } from './util.interface/util.retry.params';

let serverIp: string;

@Injectable()
export class UtilService {

  public constructor(
    private readonly httpService: HttpService,
    private readonly loggerService: LoggerService,
  ) { }

  /**
   * Asynchronously wait for desired amount of milliseconds.
   * @param ms
   */
  public async sleep(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Wait for target promise resolution withing desired timeout.
   * On failure throw a timeout exception.
   * @param promise
   * @param timeout
   */
  public async resolveOrTimeout<T>(promise: Promise<T>, timeout: number): Promise<T> {
    this.loggerService.debug(`[UtilService] Resolving promise with ${timeout / 1000}s timeout...`);

    const result = await Promise.race([
      promise,
      new Promise((reject) => setTimeout(() => reject('timed out'), timeout)),
    ]);

    if (result === 'timed out') {
      throw new Error(`async resolution timed out after ${timeout / 1000}s`);
    }

    return result as T;
  }

  /**
   * Retry a method for configured times or until desired timeout.
   * @param params
   */
  // eslint-disable-next-line complexity
  public async retryOnException<T>(params: UtilRetryParams): Promise<T> {
    const txtName = `${params.name || 'retryOnException()'}`;
    const txtPrefix = `[UtilService] ${txtName}:`;
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

  /**
   * Returns current server ip and caches result for future use.
   * In case of error log an exception but do not throw.
   */
  public async getServerIp(): Promise<string> {
    if (!serverIp) {
      try {
        serverIp = await this.httpService.get('https://api64.ipify.org', { timeout: 2500 });
      }
      catch (e) {
        this.loggerService.warning('[UtilService] Failed to acquire server ip address', e);
        return null;
      }
    }

    return serverIp;
  }

  /**
   * Reads data regarding current runtime and network.
   * Let network acquisition fail if unable to fetch ips.
   */
  public async getAppStatus(): Promise<UtilAppStatus> {
    return {
      system: {
        version: os.version(),
        type: os.type(),
        release: os.release(),
        architecture: os.arch(),
        endianness: os.endianness(),
        uptime: os.uptime(),
      },
      memory: {
        total: os.totalmem(),
        free: os.freemem(),
      },
      cpus: os.cpus(),
      network: {
        publicIp: await this.getServerIp(),
        interfaces: os.networkInterfaces(),
      },
    };
  }

}
