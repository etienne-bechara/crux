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
    const durationHistogram = this.metricService.getHistogram(AppMetric.HTTP_INBOUND_DURATION);
    const ingressHistogram = this.metricService.getHistogram(AppMetric.HTTP_INBOUND_INGRESS);
    const egressHistogram = this.metricService.getHistogram(AppMetric.HTTP_INBOUND_EGRESS);

    return next
      .handle()
      .pipe(
        // eslint-disable-next-line @typescript-eslint/require-await
        mergeMap(async (data) => {
          const method = this.contextService.getRequestMethod();
          const path = this.contextService.getRequestPath();
          const code = this.contextService.getResponseCode() || HttpStatus.OK;
          const duration = this.contextService.getRequestDuration();
          const ingress = Number(this.contextService.getRequestHeader('content-length') || 0);
          const egress = Number(this.contextService.getResponseHeader('content-length') || 0);

          durationHistogram.labels(method, path, code.toString()).observe(duration);
          ingressHistogram.labels(method, path, code.toString()).observe(ingress);
          egressHistogram.labels(method, path, code.toString()).observe(egress);

          return data;
        }),
      );
  }

}
