import { CallHandler, ExecutionContext, HttpStatus, Injectable, NestInterceptor } from '@nestjs/common';
import { mergeMap, Observable } from 'rxjs';

import { AppMetric } from '../app/app.enum';
import { ContextService } from '../context/context.service';
import { MetricService } from './metric.service';

@Injectable()
export class MetricInterceptor implements NestInterceptor {

  public constructor(
    private readonly contextService: ContextService,
    private readonly metricService: MetricService,
  ) { }

  /**
   * Log metrics for successful inbound HTTP requests.
   * @param context
   * @param next
   */
  public intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const histogram = this.metricService.getHistogram(AppMetric.HTTP_INBOUND_LATENCY);

    return next
      .handle()
      .pipe(
        // eslint-disable-next-line @typescript-eslint/require-await
        mergeMap(async (data) => {
          const method = this.contextService.getRequestMethod();
          const path = this.contextService.getRequestPath();
          const code = this.contextService.getResponseCode() || HttpStatus.OK;
          const latency = this.contextService.getRequestLatency();

          histogram.labels(method, path, code.toString()).observe(latency);

          return data;
        }),
      );
  }

}
