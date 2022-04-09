import { HttpStatus, Injectable } from '@nestjs/common';
import { SemanticAttributes } from '@opentelemetry/semantic-conventions';
import os from 'os';

import { ContextService } from '../context/context.service';
import { HttpService } from '../http/http.service';
import { LogService } from '../log/log.service';
import { MetricService } from '../metric/metric.service';
import { TraceService } from '../trace/trace.service';
import { AppStatus } from './app.dto';
import { AppMetric } from './app.enum';

@Injectable()
export class AppService {

  private publicIp: string;

  public constructor(
    private readonly contextService: ContextService,
    private readonly httpService: HttpService,
    private readonly logService: LogService,
    private readonly metricService: MetricService,
    private readonly traceService: TraceService,
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
      this.logService.warning('Failed to acquire public IP', e as Error);
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

  /**
   * Register logs, metrics and tracing of inbound request.
   * @param code
   */
  public collectInboundTelemetry(code: HttpStatus): void {
    const span = this.contextService.getSpan();
    const durationHistogram = this.metricService?.getHistogram(AppMetric.HTTP_INBOUND_DURATION);

    const method = this.contextService.getRequestMethod();
    const path = this.contextService.getRequestPath();
    const duration = this.contextService.getRequestDuration();

    if (durationHistogram) {
      durationHistogram.labels(method, path, code.toString()).observe(duration);
    }

    if (span) {
      span.setAttributes({
        [SemanticAttributes.HTTP_METHOD]: method,
        [SemanticAttributes.HTTP_ROUTE]: path,
        [SemanticAttributes.HTTP_STATUS_CODE]: code,
        'http.duration': duration,
      });

      span.end();
    }
  }

}
