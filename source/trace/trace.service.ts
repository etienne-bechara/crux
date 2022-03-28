/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-import-assign */
import { Injectable } from '@nestjs/common';
import { Context, context, diag, DiagLogger, DiagLogLevel, Span, SpanOptions, trace } from '@opentelemetry/api';
import { CompressionAlgorithm, OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import * as OTLPUtil from '@opentelemetry/exporter-trace-otlp-http/build/src/platform/node/util';
import { B3Propagator } from '@opentelemetry/propagator-b3';
import { Resource } from '@opentelemetry/resources';
import { BasicTracerProvider, BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import zlib from 'zlib';

import { AppConfig } from '../app/app.config';
import { AppRequestMetadata } from '../app/app.interface';
import { ContextService } from '../context/context.service';
import { HttpConfig } from '../http/http.config';
import { HttpService } from '../http/http.service';
import { LogService } from '../log/log.service';
import { TraceConfig } from './trace.config';
import { TraceAppDiag } from './trace.interface';

@Injectable()
export class TraceService {

  private httpService: HttpService;

  public constructor(
    private readonly appConfig: AppConfig,
    private readonly contextService: ContextService<AppRequestMetadata>,
    private readonly httpConfig: HttpConfig,
    private readonly logService: LogService,
    private readonly traceConfig: TraceConfig,
  ) {
    this.setupTracer();
  }

  /**
   * Sets up the tracer client.
   */
  private setupTracer(): void {
    const { traces } = this.appConfig.APP_OPTIONS || { };
    const { url } = traces;
    const traceUrl = this.traceConfig.TRACE_URL || url;

    if (!traceUrl) {
      this.logService.warning('Trace disable due to missing URL');
      return;
    }

    this.setupOpenTelemetryComponents();
  }

  /**
   * Sets up the tracer client, which includes:
   * - Custom diag to log warning as errors integrated with application logger
   * - HTTP client override to send traces through built-in implementation
   * - Batch processor for trace publishing
   * - Trace provider stamping environment, job and instance
   * - Propagator using B3 standard headers.
   */
  private setupOpenTelemetryComponents(): void {
    const { job, instance, traces } = this.appConfig.APP_OPTIONS || { };
    const { url, username, password, pushInterval } = traces;
    const environment = this.appConfig.NODE_ENV;
    const traceUrl = this.traceConfig.TRACE_URL || url;

    diag.setLogger(
      new TraceAppDiag(this.logService) as any as DiagLogger,
      DiagLogLevel.WARN,
    );

    this.httpService = new HttpService({
      name: 'TraceModule',
      prefixUrl: traceUrl,
      username: this.traceConfig.TRACE_USERNAME ?? username,
      password: this.traceConfig.TRACE_PASSWORD ?? password,
    }, this.httpConfig, null, null, null);

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

    const propagator = new B3Propagator();

    provider.addSpanProcessor(processor);
    provider.register({ propagator });
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
      onError(e);
    }
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
