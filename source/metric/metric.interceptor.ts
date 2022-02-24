import { CallHandler, ExecutionContext, HttpStatus, Injectable, NestInterceptor } from '@nestjs/common';
import { finalize, Observable } from 'rxjs';

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
    const req = this.contextService.getRequest();
    const histogram = this.metricService.getHttpInboundHistogram();

    const { time, routerMethod, routerPath, headers } = req;
    const ipAddress = this.contextService.getClientIp();
    const userAgent = headers['user-agent'];
    const logMessage = `${routerMethod} ${routerPath} ${ipAddress} ${userAgent}`;

    this.loggerService.http(`> ${logMessage}`);

    return next
      .handle()
      .pipe(
        finalize(() => {
          const status = HttpStatus.OK.toString();
          const latency = Date.now() - time;

          histogram.labels(routerMethod, routerPath, status).observe(latency);
          this.loggerService.http(`< ${logMessage} [${latency} ms]`);
        }),
      );
  }

}
