import { Injectable } from '@nestjs/common';
import { collectDefaultMetrics, Histogram, Metric, Registry } from 'prom-client';

import { AppConfig } from '../app/app.config';

@Injectable()
export class MetricService {

  private register: Registry;
  private httpInboundHistogram: Histogram<any>;
  private httpOutboundHistogram: Histogram<any>;

  public constructor(
    private readonly appConfig: AppConfig,
  ) {
    this.setupRegistry();
  }

  /**
   * Create Prometheus metrics registry and built-in histograms.
   */
  private setupRegistry(): void {
    const { metrics } = this.appConfig.APP_OPTIONS || { };
    const { defaultPrefix, defaultLabels, defaultBuckets } = metrics;
    this.register = new Registry();

    collectDefaultMetrics({
      register: this.register,
      prefix: defaultPrefix,
      labels: defaultLabels,
      gcDurationBuckets: defaultBuckets,
    });
  }

  /**
   * Acquires the underlying Prometheus registry.
   */
  public getRegister(): Registry {
    return this.register;
  }

  /**
   * Acquires configured inbound HTTP histogram.
   */
  public getHttpInboundHistogram(): Histogram<'method' | 'path' | 'code'> {
    if (!this.httpInboundHistogram) {
      const { metrics } = this.appConfig.APP_OPTIONS || { };
      const { httpBuckets } = metrics;

      this.httpInboundHistogram = new Histogram({
        name: 'http_inbound_latency',
        help: 'Latency of inbound HTTP requests in milliseconds.',
        labelNames: [ 'method', 'path', 'code' ],
        buckets: httpBuckets,
      });

      this.registerMetric(this.httpInboundHistogram);
    }

    return this.httpInboundHistogram;
  }

  /**
   * Acquires configured outbound HTTP histogram.
   */
  public getHttpOutboundHistogram(): Histogram<'method' | 'host' | 'path' | 'code'> {
    if (!this.httpOutboundHistogram) {
      const { metrics } = this.appConfig.APP_OPTIONS || { };
      const { httpBuckets } = metrics;

      this.httpOutboundHistogram = new Histogram({
        name: 'http_outbound_latency',
        help: 'Latency of outbound HTTP requests in milliseconds.',
        labelNames: [ 'method', 'host', 'path', 'code' ],
        buckets: httpBuckets,
      });

      this.registerMetric(this.httpOutboundHistogram);
    }

    return this.httpOutboundHistogram;
  }

  /**
   * Read metrics in standard Prometheus string format.
   */
  public readMetrics(): Promise<string> {
    return this.register.metrics();
  }

  /**
   * Registers target metric.
   * @param params
   */
  public registerMetric(params: Metric<string>): void {
    this.register.registerMetric(params);
  }

}
