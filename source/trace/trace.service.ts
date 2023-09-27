import * as grpc from '@grpc/grpc-js';
import { Injectable } from '@nestjs/common';
import { Context, context, diag, DiagLogLevel, Span, SpanOptions, SpanStatusCode, trace } from '@opentelemetry/api';
import { AsyncHooksContextManager } from '@opentelemetry/context-async-hooks';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { B3Propagator } from '@opentelemetry/propagator-b3';
import { Resource } from '@opentelemetry/resources';
import { BasicTracerProvider, BatchSpanProcessor, ParentBasedSampler, TraceIdRatioBasedSampler } from '@opentelemetry/sdk-trace-base';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

import { AppConfig } from '../app/app.config';
import { LogService } from '../log/log.service';
import { TraceConfig } from './trace.config';
import { TraceDiagConsoleLogger } from './trace.diag';

@Injectable()
export class TraceService {

  private static job: string;

  public constructor(
    private readonly appConfig: AppConfig,
    private readonly logService: LogService,
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
      this.logService.warning('Tracing disabled due to missing URL');
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
   * - Batch processor for trace publishing
   * - Trace provider stamping environment, job and instance
   * - Propagator using B3 standard headers
   * - Context tracking using async hooks.
   */
  private setupOpenTelemetryComponents(): void {
    const { name: job, instance, traces } = this.appConfig.APP_OPTIONS || { };
    const { username, password, pushInterval, batchSize, samplerRatio } = traces;

    const environment = this.appConfig.NODE_ENV;
    const contextManager = new AsyncHooksContextManager();
    const propagator = new B3Propagator();
    const metadata = new grpc.Metadata();
    const config: Record<string, unknown> = { url: this.buildTraceUrl() };

    diag.setLogger(new TraceDiagConsoleLogger(this.logService), DiagLogLevel.WARN);
    TraceService.job = job;

    if (username) {
      metadata.set('authorization', `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`);
      config.credentials = grpc.credentials.createSsl();
      config.metadata = metadata;
    }

    const exporter = new OTLPTraceExporter(config);

    const processor = new BatchSpanProcessor(exporter, {
      scheduledDelayMillis: pushInterval,
      maxQueueSize: batchSize * 10,
      maxExportBatchSize: batchSize,
    });

    const provider = new BasicTracerProvider({
      sampler: new ParentBasedSampler({
        root: new TraceIdRatioBasedSampler(samplerRatio),
      }),
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
