import { Injectable } from '@nestjs/common';
import { trace, Tracer } from '@opentelemetry/api';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { BasicTracerProvider, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';

import { AppConfig } from '../app/app.config';

@Injectable()
export class TraceService {

  public constructor(
    private readonly appConfig: AppConfig,
  ) {
    this.setupTracer();
  }

  /**
   * Sets up the tracer client.
   */
  private setupTracer(): void {
    const exporter = new OTLPTraceExporter({
      url: 'http://127.0.0.1:55681/v1/traces',
    });

    const processor = new SimpleSpanProcessor(exporter);
    const provider = new BasicTracerProvider();
    provider.addSpanProcessor(processor);
    provider.register();
  }

  /**
   * Get current tracer.
   */
  public getTracer(): Tracer {
    return trace.getTracer('sample-123');
  }

}
