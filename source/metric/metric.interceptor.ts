import { CallHandler, ExecutionContext, HttpStatus, Injectable, NestInterceptor } from '@nestjs/common';
import { mergeMap, Observable } from 'rxjs';

import { ContextService } from '../context/context.service';
import { LoggerService } from '../logger/logger.service';
import { MetricService } from './metric.service';

@Injectable()
export class MetricInterceptor implements NestInterceptor {

  public constructor(
    private readonly contextService: ContextService,
    private readonly loggerService: LoggerService,
    private readonly metricService: MetricService,
  ) { }

  /**
   * Log metrics for successful inbound HTTP requests.
   * @param context
   * @param next
   */
  public intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const histogram = this.metricService.getHttpInboundHistogram();

    this.loggerService.http(this.contextService.getRequestDescription());

    return next
      .handle()
      .pipe(
        // eslint-disable-next-line @typescript-eslint/require-await
        mergeMap(async () => {
          const latency = this.contextService.getRequestLatency();
          const method = this.contextService.getRequestMethod();
          const path = this.contextService.getRequestPath();
          const status = HttpStatus.OK;

          histogram.labels(method, path, status.toString()).observe(latency);
          this.loggerService.http(this.contextService.getRequestDescription(status));
        }),
      );
  }

}
