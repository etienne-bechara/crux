import { Injectable } from '@nestjs/common';
import os from 'os';

import { HttpService } from '../http/http.service';
import { LoggerService } from '../logger/logger.service';
import { AppStatus } from './app.interface';

let serverIp: string;

@Injectable()
export class AppService {

  public constructor(
    private readonly httpService: HttpService,
    private readonly loggerService: LoggerService,
  ) { }

  /**
   * Returns current server ip and caches result for future use.
   * In case of error log an exception but do not throw.
   */
  public async getPublicIp(): Promise<string> {
    if (!serverIp) {
      try {
        serverIp = await this.httpService.get('https://api64.ipify.org', {
          timeout: 2500,
        });
      }
      catch (e: unknown) {
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
  public async getStatus(): Promise<AppStatus> {
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
        publicIp: await this.getPublicIp(),
        interfaces: os.networkInterfaces(),
      },
    };
  }

}
