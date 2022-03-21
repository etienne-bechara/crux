import { CallHandler, ExecutionContext, HttpStatus, Injectable, NestInterceptor } from '@nestjs/common';
import { mergeMap, Observable } from 'rxjs';

import { LogService } from '../log/log.service';
import { ContextService } from './context.service';

@Injectable()
export class ContextInterceptor implements NestInterceptor {

  public constructor(
    private readonly contextService: ContextService,
    private readonly logService: LogService,
  ) { }

  /**
   * Log inbound HTTP requests.
   * @param context
   * @param next
   */
  public intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    this.logService.http(this.contextService.getRequestDescription('in'), {
      method: this.contextService.getRequestMethod(),
      path: this.contextService.getRequestPath(),
      clientIp: this.contextService.getRequestIp(),
      params: this.contextService.getRequestParams(),
      query: this.contextService.getRequestQuery(),
      body: this.contextService.getRequestBody(),
      headers: this.contextService.getRequestHeaders(),
    });

    return next
      .handle()
      .pipe(
        // eslint-disable-next-line @typescript-eslint/require-await
        mergeMap(async (data) => {
          this.logService.http(this.contextService.getRequestDescription('out'), {
            latency: this.contextService.getRequestLatency(),
            code: this.contextService.getResponseCode() || HttpStatus.OK,
            body: data,
          });

          return data;
        }),
      );
  }

}
