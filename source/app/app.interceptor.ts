import { CallHandler, ExecutionContext, GatewayTimeoutException, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { finalize, timeout } from 'rxjs/operators';

import { ContextService } from '../context/context.service';
import { LoggerService } from '../logger/logger.service';
import { AppModule } from './app.module';

@Injectable()
export class AppLoggerInterceptor implements NestInterceptor {

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

@Injectable()
export class AppTimeoutInterceptor implements NestInterceptor {

  /**
   * Creates a true server side timer that ends any requests
   * if exceeding configured timeout.
   *
   * If using serverless, remember to configure service timeout
   * over the one configure here at the application.
   * @param context
   * @param next
   */
  public intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const msTimeout = AppModule.getOptions().timeout;
    if (!msTimeout) return next.handle();

    return next
      .handle()
      .pipe(
        timeout({
          first: msTimeout,
          with: () => throwError(() => new GatewayTimeoutException('failed to fulfill request within timeout')),
        }),
      );
  }

}
