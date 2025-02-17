/* eslint-disable promise/prefer-await-to-then */
/* eslint-disable @typescript-eslint/naming-convention */
import { Span, SpanOptions } from '@opentelemetry/api';

import { TraceService } from './trace.service';

/**
 * Wraps target method into a traceable span.
 * @param name
 * @param options
 */
export function Span(name?: string, options?: SpanOptions) {
  return (target: any, propertyKey: string, propertyDescriptor: PropertyDescriptor): void => {
    const spanName = name || `${target.constructor.name.replace('Service', '')} | ${propertyKey}`;
    const sourceMethod = propertyDescriptor.value;
    const isAsync = sourceMethod.constructor.name === 'AsyncFunction';

    const wrapperMethod = function PropertyDescriptor(this: any, ...args: any[]): any {
      return isAsync
        ? TraceService.startManagedSpan(spanName, options || { }, async () => {
          return await sourceMethod.apply(this, args);
        })
        : TraceService.startManagedSpan(spanName, options || { }, () => {
          return sourceMethod.apply(this, args);
        });
    };

    propertyDescriptor.value = wrapperMethod;
  };
}
