import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { mergeMap, Observable } from 'rxjs';

import { ContextService } from '../context/context.service';
import { TracerService } from './tracer.service';

@Injectable()
export class TracerInterceptor implements NestInterceptor {

  public constructor(
    private readonly contextService: ContextService,
    private readonly tracerService: TracerService,
  ) { }

  /**
   * Extracts parent tracer and wrap request into a span.
   * @param context
   * @param next
   */
  public intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // const headers = this.contextService.getRequestHeaders();
    const parent = this.tracerService.getTracer().startSpan('main');

    return next
      .handle()
      .pipe(
        // eslint-disable-next-line @typescript-eslint/require-await
        mergeMap(async (data) => {
          parent.end();
          return data;
        }),
      );
  }

}
