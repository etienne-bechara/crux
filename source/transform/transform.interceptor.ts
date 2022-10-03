import { CallHandler, ClassSerializerInterceptor, ExecutionContext, Injectable, NestInterceptor, PlainLiteralObject } from '@nestjs/common';
import { map, Observable } from 'rxjs';

import { TraceService } from '../trace/trace.service';

@Injectable()
export class TransformInterceptor extends ClassSerializerInterceptor implements NestInterceptor {

  /**
   * Overwrite behaviour of built in NestJS serializar by adding tracing.
   * @param context
   * @param next
   */
  public intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const contextOptions = this.getContextOptions(context);
    const options = { ...this.defaultOptions, ...contextOptions };

    return next
      .handle()
      .pipe(
        map((res: PlainLiteralObject | PlainLiteralObject[]) => {
          return TraceService.startManagedSpan('App | Serialization Interceptor', { }, () => {
            return this.serialize(res, options);
          });
        }),
      );
  }

}
