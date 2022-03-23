import { Injectable } from '@nestjs/common';
import { Context, context, diag, DiagLogger, DiagLogLevel, Span, SpanOptions, trace } from '@opentelemetry/api';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { B3Propagator } from '@opentelemetry/propagator-b3';
import { Resource } from '@opentelemetry/resources';
import { BasicTracerProvider, BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

import { AppConfig } from '../app/app.config';
import { AppRequestMetadata } from '../app/app.interface';
import { ContextService } from '../context/context.service';
import { LogService } from '../log/log.service';
import { TraceConfig } from './trace.config';
import { TraceAppDiag } from './trace.interface';

@Injectable()
export class TraceService {

  public constructor(
    private readonly appConfig: AppConfig,
    private readonly contextService: ContextService<AppRequestMetadata>,
    private readonly logService: LogService,
    private readonly traceConfig: TraceConfig,
  ) {
    this.setupTracer();
  }

  /**
   * Sets up the tracer client.
   */
  private setupTracer(): void {
    const { job, instance, traces } = this.appConfig.APP_OPTIONS || { };
    const { url, username, password, pushInterval } = traces;
    const environment = this.appConfig.NODE_ENV;

    const traceUrl = this.traceConfig.TRACE_URL || url;
    const traceUsername = this.traceConfig.TRACE_USERNAME ?? username;
    const tracePassword = this.traceConfig.TRACE_PASSWORD ?? password;

    if (!traceUrl) {
      this.logService.warning('Trace disable due to missing URL');
      return;
    }

    diag.setLogger(
      new TraceAppDiag(this.logService) as any as DiagLogger,
      DiagLogLevel.WARN,
    );

    const exporter = new OTLPTraceExporter({
      url: `${traceUrl}/v1/traces`,
      headers: username
        ? {
          authorization: `Basic ${Buffer.from(`${traceUsername}:${tracePassword}`).toString('base64')}`,
        }
        : undefined,
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

    const propagator = new B3Propagator();

    provider.addSpanProcessor(processor);
    provider.register({ propagator });
  }

  /**
   * Acquires the span tied to current request.
   */
  public getRequestSpan(): Span {
    return this.contextService.getMetadata('span');
  }

  /**
   * Acquires the context tied to current request.
   */
  public getRequestContext(): Context {
    return trace.setSpan(context.active(), this.getRequestSpan());
  }

  /**
   * Acquires context of target span.
   * @param span
   */
  public getSpanContext(span: Span): Context {
    return trace.setSpan(context.active(), span);
  }

  /**
   * Starts a new span, if `parent` is omitted uses current request.
   * @param name
   * @param options
   * @param parent
   */
  public startSpan(name: string, options?: SpanOptions, parent?: Span): Span {
    const { job } = this.appConfig.APP_OPTIONS;

    const ctx = parent
      ? trace.setSpan(context.active(), parent)
      : this.getRequestContext();

    return trace.getTracer(job).startSpan(name, options, ctx);
  }

}
