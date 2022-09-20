import { HttpStatus, Injectable } from '@nestjs/common';
import { SpanStatusCode } from '@opentelemetry/api';
import { SemanticAttributes } from '@opentelemetry/semantic-conventions';
import os from 'os';

import { ContextService } from '../context/context.service';
import { MetricService } from '../metric/metric.service';
import { AppStatus } from './app.dto';
import { AppTraffic } from './app.enum';

@Injectable()
export class AppService {

  public constructor(
    private readonly contextService: ContextService,
    private readonly metricService: MetricService,
  ) { }

  /**
   * Reads data regarding current runtime and network.
   */
  public getStatus(): AppStatus {
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
        interfaces: os.networkInterfaces(),
      },
    };
  }

  /**
   * Register logs, metrics and tracing of inbound request.
   *
   * In the event of paths unspecified by controllers, replace them with
   * `*` in order to reduce amount of timeseries.
   * @param code
   * @param error
   */
  public collectInboundTelemetry(code: HttpStatus, error?: Error): void {
    const span = this.contextService.getRequestSpan();
    const httpMetric = this.metricService?.getHttpMetric();

    const method = this.contextService.getRequestMethod();
    const host = this.contextService.getRequestHost();
    const duration = this.contextService.getRequestDuration();
    const cache = this.contextService.getCacheStatus();

    const path = code === HttpStatus.NOT_FOUND && error?.message?.startsWith('Cannot')
      ? '/*'
      : this.contextService.getRequestPath();

    if (httpMetric) {
      httpMetric.labels(AppTraffic.INBOUND, method, host, path, code.toString(), cache).observe(duration);
    }

    if (span) {
      span.setAttributes({
        [SemanticAttributes.HTTP_METHOD]: method,
        [SemanticAttributes.HTTP_ROUTE]: path,
        [SemanticAttributes.HTTP_STATUS_CODE]: code,
        'http.duration': duration, // eslint-disable-line @typescript-eslint/naming-convention
      });

      if (error) {
        span.recordException(error);
        span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
      }
      else {
        span.setStatus({ code: SpanStatusCode.OK });
      }

      span.end();
    }
  }

}
