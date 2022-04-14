import { CallHandler, ExecutionContext, GatewayTimeoutException, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { timeout } from 'rxjs/operators';

import { ContextService } from '../context/context.service';
import { AppConfig } from './app.config';
import { AppMetadata } from './app.enum';

@Injectable()
export class AppTimeout implements NestInterceptor {

  public constructor(
    private readonly appConfig: AppConfig,
    private readonly contextService: ContextService,
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
    const { timeout: msTimeout } = this.appConfig.APP_OPTIONS;
    if (!msTimeout) return next.handle();

    return next
      .handle()
      .pipe(
        timeout({
          first: msTimeout,
          with: () => throwError(() => {
            this.contextService.setMetadata(AppMetadata.REQUEST_TIMEOUT, true);
            return new GatewayTimeoutException('failed to fulfill request within timeout');
          }),
        }),
      );
  }

}
