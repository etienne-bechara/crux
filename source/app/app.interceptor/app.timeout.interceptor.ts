import { CallHandler, ExecutionContext, GatewayTimeoutException, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, throwError, TimeoutError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

import { AppConfig } from '../app.config';

@Injectable()
export class AppTimeoutInterceptor implements NestInterceptor {

  public constructor(
    private readonly appConfig: AppConfig,
  ) { }

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
    const msTimeout = this.appConfig.appTimeout;
    if (!msTimeout) return next.handle();

    return next
      .handle()
      .pipe(
        timeout(msTimeout),
        catchError(err => {
          if (err instanceof TimeoutError) {
            return throwError(
              new GatewayTimeoutException('failed to fulfill request within timeout'),
            );
          }

          return throwError(err);
        }),
      );
  }

}
