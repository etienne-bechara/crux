import { Injectable } from '@nestjs/common';
import os from 'os';

import { HttpService } from '../http/http.service';
import { LoggerService } from '../logger/logger.service';
import { AppStatus } from './app.dto';

@Injectable()
export class AppService {

  private publicIp: string;

  public constructor(
    private readonly httpService: HttpService,
    private readonly loggerService: LoggerService,
  ) { }

  /**
   * Returns current server ip and caches result for future use.
   * In case of error log an exception but do not throw.
   */
  public async getPublicIp(): Promise<string> {
    if (!this.publicIp) {
      this.publicIp = await this.httpService.get('https://api64.ipify.org', {
        responseType: 'text',
        timeout: 2500,
      });
    }

    return this.publicIp;
  }

  /**
   * Reads data regarding current runtime and network.
   * Let network acquisition fail if unable to fetch public IP.
   */
  public async getStatus(): Promise<AppStatus> {
    let publicIp: string;

    try {
      publicIp = await this.getPublicIp();
    }
    catch (e) {
      this.loggerService.warning('Failed to acquire public IP', e as Error);
    }

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
        publicIp,
        interfaces: os.networkInterfaces(),
      },
    };
  }

}
