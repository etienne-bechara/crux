/* eslint-disable promise/prefer-await-to-then */
/* eslint-disable @typescript-eslint/naming-convention */
import { Span, SpanOptions, SpanStatusCode } from '@opentelemetry/api';

import { TraceService } from './trace.service';

/**
 * Wraps target method into a traceable span.
 * @param name
 * @param options
 */
export function Span(name?: string, options?: SpanOptions) {
  return (target: any, propertyKey: string, propertyDescriptor: PropertyDescriptor): void => {
    const spanName = name || `${target.constructor.name}.${propertyKey}()`;
    const sourceMethod = propertyDescriptor.value;
    const isAsync = sourceMethod.constructor.name === 'AsyncFunction';

    const wrapperMethod = function PropertyDescriptor(...args: any[]): any {
      return isAsync
        ? TraceService.startActiveSpan(spanName, options, async (span: Span) => {
          try {
            const result = await sourceMethod.apply(this, args);
            span.setStatus({ code: SpanStatusCode.OK });
            return result;
          }
          catch (e) {
            span.recordException(e as Error);
            span.setStatus({ code: SpanStatusCode.ERROR, message: e.message });
            throw e;
          }
          finally {
            span.end();
          }
        })
        : TraceService.startActiveSpan(spanName, options, (span: Span) => {
          try {
            const result = sourceMethod.apply(this, args);
            span.setStatus({ code: SpanStatusCode.OK });
            return result;
          }
          catch (e) {
            span.recordException(e as Error);
            span.setStatus({ code: SpanStatusCode.ERROR, message: e.message });
            throw e;
          }
          finally {
            span.end();
          }
        });
    };

    propertyDescriptor.value = wrapperMethod;
  };
}
