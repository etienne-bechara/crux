import { Injectable } from '@nestjs/common';
import os from 'os';
import requestIp from 'request-ip';

import { AppRequest } from '../app/app.interface';
import { HttpsService } from '../https/https.service';
import { LoggerService } from '../logger/logger.service';
import { UtilAppStatus } from './util.interface';
import { UtilRetryParams } from './util.interface/util.retry.params';

@Injectable()
export class UtilService {

  private serverIp: string;

  public constructor(
    private readonly httpsService: HttpsService,
    private readonly loggerService: LoggerService,
  ) { }

  /**
   * Asynchronously wait for desired amount of milliseconds.
   * @param ms
   */
  public async halt(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Retry a method for configured times or until desired timeout.
   * @param params
   */
  public async retryOnException<T>(params: UtilRetryParams): Promise<T> {
    const methodName = params.name || 'Unnamed';

    let startMsg = `${methodName}: running with ${params.retries || '∞'} `;
    startMsg += `retries and ${params.timeout / 1000 || '∞ '}s timeout...`;
    this.loggerService.debug(startMsg);

    const startTime = new Date().getTime();
    let tentative = 1;
    let result: T;

    while (true) { // eslint-disable-line no-constant-condition
      try {
        result = await params.method();
        break;
      }
      catch (e) {
        const elapsed = new Date().getTime() - startTime;

        if (params.retries && tentative > params.retries) throw e;
        else if (params.timeout && elapsed > params.timeout) throw e;
        else if (params.breakIf?.(e)) throw e;
        tentative++;

        let retryMsg = `${methodName}: ${e.message} | Retry #${tentative}/${params.retries || '∞'}`;
        retryMsg += `, elapsed ${elapsed / 1000}/${params.timeout / 1000 || '∞ '}s...`;
        this.loggerService.debug(retryMsg);

        await this.halt(params.delay || 0);
      }
    }

    this.loggerService.debug(`${methodName}: finished successfully!`);
    return result;
  }

  /**
   * Given a request object, extracts the client ip.
   * @param req
   */
  public getClientIp(req: AppRequest): string {
    const forwardedIpRegex = /by.+?for=(.+?);/g;
    let forwardedIp;

    if (req.headers.forwarded) {
      forwardedIp = forwardedIpRegex.exec(req.headers.forwarded);
    }

    return forwardedIp
      ? forwardedIp[1]
      : requestIp.getClientIp(req);
  }

  /**
   * Returns current server ip and caches result for future use.
   * In case of error log an exception but do not throw.
   */
  public async getServerIp(): Promise<string> {
    if (!this.serverIp) {
      try {
        this.serverIp = await this.httpsService.get('https://api64.ipify.org', {
          timeout: 5000,
        });
      }
      catch (e) {
        this.loggerService.error('failed to acquire server ip address', e);
      }
    }

    return this.serverIp;
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
        public_ip: await this.getServerIp(),
        interfaces: os.networkInterfaces(),
      },
    };
  }

}
