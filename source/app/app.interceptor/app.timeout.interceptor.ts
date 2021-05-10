import { CallHandler, ExecutionContext, GatewayTimeoutException, Injectable, NestInterceptor } from '@nestjs/common';
import { throwError } from 'rxjs';
import { timeout } from 'rxjs/operators';

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
  public intercept(context: ExecutionContext, next: CallHandler): any {
    const msTimeout = this.appConfig.APP_BOOT_OPTIONS.timeout;
    if (!msTimeout) return next.handle();

    return next
      .handle()
      .pipe(
        timeout({
          first: msTimeout,
          with: () => throwError(() => new GatewayTimeoutException('failed to fulfill request within timeout')),
        }) as any,
      );
  }

}
