import { CallHandler, ExecutionContext, HttpStatus, Injectable, NestInterceptor } from '@nestjs/common';
import { mergeMap, Observable } from 'rxjs';

import { ContextService } from '../context/context.service';
import { LogService } from '../log/log.service';
import { AppService } from './app.service';

@Injectable()
export class AppInterceptor implements NestInterceptor {

  public constructor(
    private readonly appService: AppService,
    private readonly contextService: ContextService,
    private readonly logService: LogService,
  ) { }

  /**
   * Log all inbound HTTP requests and collect telemetry of successful ones.
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
          const code = this.contextService.getResponseCode() || HttpStatus.OK;

          this.logService.http(this.contextService.getRequestDescription('out'), {
            duration: this.contextService.getRequestDuration(),
            code,
            body: data,
          });

          this.appService.collectInboundTelemetry(code);

          return data;
        }),
      );
  }

}
