import { CallHandler, ExecutionContext, GatewayTimeoutException, HttpStatus, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { mergeMap, timeout } from 'rxjs/operators';

import { ContextService } from '../context/context.service';
import { LoggerService } from '../logger/logger.service';
import { AppModule } from './app.module';

@Injectable()
export class AppLoggerInterceptor implements NestInterceptor {

  public constructor(
    private readonly contextService: ContextService,
    private readonly loggerService: LoggerService,
  ) { }

  /**
   * Log inbound HTTP requests.
   * @param context
   * @param next
   */
  public intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    this.loggerService.http(this.contextService.getRequestDescription());

    return next
      .handle()
      .pipe(
        // eslint-disable-next-line @typescript-eslint/require-await
        mergeMap(async (data) => {
          this.loggerService.http(this.contextService.getRequestDescription(HttpStatus.OK));
          return data;
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
