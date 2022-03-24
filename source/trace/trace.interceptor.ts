import { CallHandler, ExecutionContext, HttpStatus, Injectable, NestInterceptor } from '@nestjs/common';
import { SemanticAttributes } from '@opentelemetry/semantic-conventions';
import { mergeMap, Observable } from 'rxjs';

import { AppRequestMetadata } from '../app/app.interface';
import { ContextService } from '../context/context.service';
import { TraceService } from './trace.service';

@Injectable()
export class TraceInterceptor implements NestInterceptor {

  public constructor(
    private readonly contextService: ContextService<AppRequestMetadata>,
    private readonly tracerService: TraceService,
  ) { }

  /**
   * Add base attributes to request span and further attributes on success.
   * @param context
   * @param next
   */
  public intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const span = this.tracerService.getRequestSpan();

    span.setAttributes({
      [SemanticAttributes.HTTP_METHOD]: this.contextService.getRequestMethod(),
      [SemanticAttributes.HTTP_ROUTE]: this.contextService.getRequestPath(),
    });

    return next
      .handle()
      .pipe(
        // eslint-disable-next-line @typescript-eslint/require-await
        mergeMap(async (data) => {
          const ingress = Number(this.contextService.getRequestHeader('content-length') || 0);
          const egress = Number(this.contextService.getResponseHeader('content-length') || 0);

          span.setAttributes({
            [SemanticAttributes.HTTP_STATUS_CODE]: this.contextService.getResponseCode() || HttpStatus.OK,
            [SemanticAttributes.HTTP_REQUEST_CONTENT_LENGTH]: ingress,
            [SemanticAttributes.HTTP_RESPONSE_CONTENT_LENGTH]: egress,
            'http.duration': this.contextService.getRequestDuration(),
          });

          span.end();
          return data;
        }),
      );
  }

}
