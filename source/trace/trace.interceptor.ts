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
   * Extracts parent tracer and wrap request into a span.
   * @param context
   * @param next
   */
  public intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const description = this.contextService.getRequestDescription('in');

    const span = this.tracerService.startSpan(description, {
      attributes: {
        [SemanticAttributes.HTTP_METHOD]: this.contextService.getRequestMethod(),
        [SemanticAttributes.HTTP_ROUTE]: this.contextService.getRequestPath(),
      },
    });

    this.contextService.setMetadata('span', span);
    this.contextService.setMetadata('traceId', span.spanContext().traceId);

    return next
      .handle()
      .pipe(
        // eslint-disable-next-line @typescript-eslint/require-await
        mergeMap(async (data) => {
          span.setAttributes({
            [SemanticAttributes.HTTP_STATUS_CODE]: this.contextService.getResponseCode() || HttpStatus.OK,
            'http.latency': this.contextService.getRequestLatency(),
          });

          span.end();
          return data;
        }),
      );
  }

}
