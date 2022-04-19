/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-import-assign */
import { Injectable } from '@nestjs/common';
import { Context, context, Span, SpanOptions, trace } from '@opentelemetry/api';
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
import { TraceConfig } from './trace.config';

@Injectable()
export class TraceService {

  private static job: string;
  private httpService: HttpService;

  public constructor(
    private readonly appConfig: AppConfig,
    private readonly logService: LogService,
    private readonly traceConfig: TraceConfig,
  ) {
    this.setupTracer();
  }

  /**
   * Ensures application has a valid push URL configured in order to
   * enable tracing.
   */
  public isEnabled(): boolean {
    const { traces } = this.appConfig.APP_OPTIONS || { };
    const { url } = traces;
    const traceUrl = this.traceConfig.TRACE_URL || url;

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
    const { job, instance, traces } = this.appConfig.APP_OPTIONS || { };
    const { url, username, password, pushInterval } = traces;

    const environment = this.appConfig.NODE_ENV;
    const traceUrl = this.traceConfig.TRACE_URL || url;

    const contextManager = new AsyncHooksContextManager();
    const propagator = new B3Propagator();

    TraceService.job = job;

    this.httpService = new HttpService({
      name: 'TraceModule',
      prefixUrl: traceUrl,
      username: this.traceConfig.TRACE_USERNAME ?? username,
      password: this.traceConfig.TRACE_PASSWORD ?? password,
    }, this.appConfig);

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
    const buffer = Buffer.from(data);
    const gzip: Buffer = await new Promise((res, rej) => zlib.gzip(buffer, (e, d) => e ? rej(e) : res(d)));

    try {
      await this.httpService.post('v1/traces', {
        headers: {
          'content-type': 'application/json',
          'content-encoding': 'gzip',
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
   * Acquires context of target span.
   * @param span
   */
  public getSpanContext(span: Span): Context {
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

}
