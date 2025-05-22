import { CallHandler, ExecutionContext, HttpStatus, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, mergeMap } from 'rxjs';

import { AppConfig } from '../app/app.config';
import { AppService } from '../app/app.service';
import { ContextService } from '../context/context.service';
import { LogService } from './log.service';

@Injectable()
export class LogInterceptor implements NestInterceptor {
  public constructor(
    private readonly appService: AppService,
    private readonly appConfig: AppConfig,
    private readonly contextService: ContextService,
    private readonly logService: LogService,
  ) {}

  /**
   * Log all inbound HTTP requests and collect telemetry of successful ones.
   * @param context
   * @param next
   */
  public intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const { enableRequestBody, enableResponseBody } = this.appConfig.APP_OPTIONS.logs || {};

    this.logService.http(this.contextService.getRequestDescription('in'), {
      method: this.contextService.getRequestMethod(),
      host: this.contextService.getRequestHost(),
      path: this.contextService.getRequestPath(),
      clientIp: this.contextService.getRequestIp(),
      params: this.contextService.getRequestParams(),
      query: this.contextService.getRequestQuery(),
      body: enableRequestBody ? this.contextService.getRequestBody() : undefined,
      headers: this.contextService.getRequestHeaders(),
    });

    return next.handle().pipe(
      mergeMap(async (data) => {
        const code = this.contextService.getResponseCode() || HttpStatus.OK;

        this.logService.http(this.contextService.getRequestDescription('out'), {
          duration: this.contextService.getRequestDuration(),
          code,
          body: enableResponseBody ? data : undefined,
        });

        this.appService.collectInboundTelemetry(code);

        return data;
      }),
    );
  }
}
