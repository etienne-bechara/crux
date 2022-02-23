import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { finalize, Observable } from 'rxjs';

import { ContextService } from '../context/context.service';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class MetricInterceptor implements NestInterceptor {

  public constructor(
    private readonly loggerService: LoggerService,
    private readonly contextService: ContextService,
  ) { }

  /**
   * Print request and response data at console for debugging purposes.
   * @param context
   * @param next
   */
  public intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = this.contextService.getRequest();
    const start = Date.now();

    const methodPath = `${req.routerMethod} ${req.routerPath}`;
    const ipAddress = this.contextService.getClientIp();
    const userAgent = req.headers['user-agent'];
    const logMessage = `${methodPath} ${ipAddress} ${userAgent}`;

    this.loggerService.http(`> ${logMessage}`);

    return next
      .handle()
      .pipe(
        finalize(() => {
          this.loggerService.http(`< ${logMessage} [${Date.now() - start} ms]`);
        }),
      );
  }

}
