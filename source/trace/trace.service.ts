/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-import-assign */
import { Injectable } from '@nestjs/common';
import { Context, context, Span, SpanOptions, SpanStatusCode, trace } from '@opentelemetry/api';
import { AsyncHooksContextManager } from '@opentelemetry/context-async-hooks';
import { CompressionAlgorithm, OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import * as OTLPUtil from '@opentelemetry/exporter-trace-otlp-http/build/src/platform/node/util';
import { B3Propagator } from '@opentelemetry/propagator-b3';
import { Resource } from '@opentelemetry/resources';
import { BasicTracerProvider, BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import zlib from 'zlib';

import { AppConfig } from '../app/app.config';
import { HttpService } from '../http/http.service';
import { LogService } from '../log/log.service';
import { PromiseService } from '../promise/promise.service';
import { TraceConfig } from './trace.config';

@Injectable()
export class TraceService {

  private static job: string;
  private httpService: HttpService;

  public constructor(
    private readonly appConfig: AppConfig,
    private readonly logService: LogService,
    private readonly promiseService: PromiseService,
    private readonly traceConfig: TraceConfig,
  ) {
    this.setupTracer();
  }

  /**
   * Acquires configured trace URL giving priority to environment variable.
   */
  private buildTraceUrl(): string {
    const { traces } = this.appConfig.APP_OPTIONS || { };
    const { url } = traces;
    return this.traceConfig.TRACE_URL || url;
  }

  /**
   * Ensures application has a valid push URL configured in order to
   * enable tracing.
   */
  public isEnabled(): boolean {
    const traceUrl = this.buildTraceUrl();

    if (!this.appConfig.APP_OPTIONS.disableTraces && !traceUrl) {
      this.logService.warning('Trace disable due to missing URL');
      this.appConfig.APP_OPTIONS.disableTraces = true;
    }

    return !this.appConfig.APP_OPTIONS.disableTraces;
  }

  /**
   * Sets up the tracer client.
   */
  private setupTracer(): void {
    if (!this.isEnabled()) return;
    this.setupOpenTelemetryComponents();
  }

  /**
   * Sets up the tracer client, which includes:
   * - HTTP client override to send traces through built-in implementation
   * - Batch processor for trace publishing
   * - Trace provider stamping environment, job and instance
   * - Propagator using B3 standard headers
   * - Context tracking using async hooks.
   */
  private setupOpenTelemetryComponents(): void {
    const { name: job, instance, traces } = this.appConfig.APP_OPTIONS || { };
    const { username, password, pushInterval } = traces;

    const environment = this.appConfig.NODE_ENV;

    const contextManager = new AsyncHooksContextManager();
    const propagator = new B3Propagator();

    TraceService.job = job;

    this.httpService = new HttpService({
      name: 'TraceModule',
      username: this.traceConfig.TRACE_USERNAME ?? username,
      password: this.traceConfig.TRACE_PASSWORD ?? password,
    }, this.appConfig, this.promiseService);

    // @ts-ignore
    OTLPUtil.sendWithHttp = (collector, data: string, contentType, onSuccess, onError): Promise<void> => {
      return this.publishTraces(data, onSuccess, onError);
    };

    const exporter = new OTLPTraceExporter({
      compression: CompressionAlgorithm.GZIP,
    });

    const processor = new BatchSpanProcessor(exporter, {
      scheduledDelayMillis: pushInterval,
    });

    const provider = new BasicTracerProvider({
      resource: new Resource({
        [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: environment,
        [SemanticResourceAttributes.SERVICE_NAME]: job,
        [SemanticResourceAttributes.SERVICE_INSTANCE_ID]: instance,
      }),
    });

    provider.addSpanProcessor(processor);
    provider.register({ propagator });

    contextManager.enable();
    context.setGlobalContextManager(contextManager);
  }

  /**
   * Overrides HTTP client with built-in including gzip compression and retry.
   * @param data
   * @param onSuccess
   * @param onError
   */
  private async publishTraces(data: string, onSuccess: any, onError: any): Promise<void> {
    const traceUrl = this.buildTraceUrl();
    const buffer = Buffer.from(data);
    const gzip: Buffer = await new Promise((res, rej) => zlib.gzip(buffer, (e, d) => e ? rej(e) : res(d)));

    try {
      await this.httpService.post(traceUrl, {
        headers: {
          'content-type': 'application/json', // eslint-disable-line @typescript-eslint/naming-convention
          'content-encoding': 'gzip', // eslint-disable-line @typescript-eslint/naming-convention
        },
        body: gzip,
        retryLimit: 2,
      });

      onSuccess();
    }
    catch (e) {
      this.logService.error('Failed to push traces', e as Error);
      onError(e);
    }
  }

  /**
   * Acquires active span.
   */
  public getActiveSpan(): Span {
    return TraceService.getActiveSpan();
  }

  /**
   * Acquires active span.
   */
  public static getActiveSpan(): Span {
    return trace.getSpan(context.active());
  }

  /**
   * Acquires context of target span.
   * @param span
   */
  public getContextBySpan(span: Span): Context {
    return TraceService.getContextBySpan(span);
  }

  /**
   * Acquires context of target span.
   * @param span
   */
  public static getContextBySpan(span: Span): Context {
    return trace.setSpan(context.active(), span);
  }

  /**
   * Starts a new span without setting it on context.
   * This method do NOT modify the current Context.
   * @param name
   * @param options
   * @param context
   */
  public startSpan(name: string, options?: SpanOptions, context?: Context): Span {
    return TraceService.startSpan(name, options, context);
  }

  /**
   * Starts a new span without setting it on context.
   * This method do NOT modify the current Context.
   * @param name
   * @param options
   * @param context
   */
  public static startSpan(name: string, options?: SpanOptions, context?: Context): Span {
    return trace.getTracer(this.job).startSpan(name, options, context);
  }

  /**
   * Starts a new Span and calls the given function passing it the created
   * span as first argument. Additionally the new span gets set in context
   * and this context is activated for the duration of the function call.
   * @param name
   * @param options
   * @param fn
   */
  public startActiveSpan(name: string, options: SpanOptions, fn: any): any {
    return TraceService.startActiveSpan(name, options, fn);
  }

  /**
   * Starts a new Span and calls the given function passing it the created
   * span as first argument. Additionally the new span gets set in context
   * and this context is activated for the duration of the function call.
   * @param name
   * @param options
   * @param fn
   */
  public static startActiveSpan(name: string, options: SpanOptions, fn: any): any {
    return trace.getTracer(this.job).startActiveSpan(name, options, fn);
  }

  /**
   * Starts a new Span setting it in context which is activated for the
   * duration of the function call. Automatically manages span closure
   * by identified if the underlying function finished successfully.
   * @param name
   * @param options
   * @param fn
   */
  public startManagedSpan(name: string, options: SpanOptions, fn: any): any {
    return TraceService.startManagedSpan(name, options, fn);
  }

  /**
   * Starts a new Span setting it in context which is activated for the
   * duration of the function call. Automatically manages span closure
   * by identified if the underlying function finished successfully.
   * @param name
   * @param options
   * @param fn
   */
  public static startManagedSpan(name: string, options: SpanOptions, fn: any): any {
    const isAsync = fn.constructor.name === 'AsyncFunction';

    return isAsync
      ? TraceService.startActiveSpan(name, options, async (span: Span) => {
        try {
          const result = await fn();
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
      : TraceService.startActiveSpan(name, options, (span: Span) => {
        try {
          const result = fn();
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
  }

}
