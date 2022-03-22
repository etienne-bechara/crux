import { Injectable } from '@nestjs/common';
import { context, diag, DiagLogger, DiagLogLevel, Span, SpanOptions, trace } from '@opentelemetry/api';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { BasicTracerProvider, BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

import { AppConfig } from '../app/app.config';
import { AppRequestMetadata } from '../app/app.interface';
import { ContextService } from '../context/context.service';
import { LogService } from '../log/log.service';
import { TraceConfig } from './trace.config';

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

    diag.setLogger(this.logService as any as DiagLogger, DiagLogLevel.ERROR);

    const exporter = new OTLPTraceExporter({
      url: `${traceUrl}/v1/traces`,
      headers: username
        ? {
          authorization: `Basic ${Buffer.from(`${traceUsername}:${tracePassword}`).toString('base64')}`,
        }
        : undefined,
    });

    // const exporter = new ConsoleSpanExporter();

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
    provider.register();
  }

  /**
   * Acquires the span tied to current request.
   */
  public getRequestSpan(): Span {
    return this.contextService.getMetadata('span');
  }

  /**
   * Starts a new span.
   * @param name
   * @param options
   */
  public startSpan(name: string, options?: SpanOptions): Span {
    const { job } = this.appConfig.APP_OPTIONS;
    return trace.getTracer(job).startSpan(name, options);
  }

  /**
   * Start a new child span under current request.
   * @param name
   * @param options
   */
  public startChildSpan(name: string, options?: SpanOptions): Span {
    const { job } = this.appConfig.APP_OPTIONS;
    const requestSpan = this.getRequestSpan();
    const ctx = trace.setSpan(context.active(), requestSpan);
    return trace.getTracer(job).startSpan(name, options, ctx);
  }

}
