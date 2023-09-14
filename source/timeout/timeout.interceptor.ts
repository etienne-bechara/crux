import { CallHandler, ExecutionContext, GatewayTimeoutException, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { timeout } from 'rxjs/operators';

import { AppConfig } from '../app/app.config';
import { ContextStorageKey } from '../context/context.enum';
import { ContextService } from '../context/context.service';
import { ContextStorage } from '../context/context.storage';

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {

  public constructor(
    private readonly appConfig: AppConfig,
    private readonly contextService: ContextService,
  ) { }

  /**
   * Creates a true server side timer that ends any requests
   * if exceeding configured timeout.
   *
   * Takes into account any time spent on guards since this
   * interceptor will only trigger after them.
   * @param context
   * @param next
   */
  public intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const { timeout: appTimeout } = this.appConfig.APP_OPTIONS;
    if (!appTimeout) return next.handle();

    const req = this.contextService.getRequest();
    const elapsed = Date.now() - req.time;
    const remaining = appTimeout - elapsed;
    const finalTimeout = remaining > 1 ? remaining : 1;

    return next
      .handle()
      .pipe(
        timeout({
          first: finalTimeout,
          with: () => throwError(() => {
            ContextStorage.getStore()?.set(ContextStorageKey.REQUEST_TIMED_OUT, true);
            return new GatewayTimeoutException('failed to fulfill request within timeout');
          }),
        }),
      );
  }

}
