import { Injectable } from '@nestjs/common';
import { collectDefaultMetrics, Histogram, Metric, Registry } from 'prom-client';

import { MetricConfig } from './metric.config';
import { MetricHttpLabel } from './metric.interface';

@Injectable()
export class MetricService {

  private register: Registry;
  private httpInboundHistogram: Histogram<MetricHttpLabel>;
  private httpOutboundHistogram: Histogram<MetricHttpLabel>;

  public constructor(
    private readonly metricConfig: MetricConfig,
  ) {
    this.setupRegistry();
  }

  /**
   * Create Prometheus metrics registry and built-in histograms.
   */
  private setupRegistry(): void {
    this.register = new Registry();
    collectDefaultMetrics({ register: this.register });
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
  public getHttpInboundHistogram(): Histogram<MetricHttpLabel> {
    if (!this.httpInboundHistogram) {
      this.httpInboundHistogram = new Histogram({
        name: 'http_inbound_latency',
        help: 'Latency of inbound HTTP requests in milliseconds.',
        labelNames: this.metricConfig.METRIC_HTTP_DEFAULT_LABELS,
        buckets: this.metricConfig.METRIC_HTTP_DEFAULT_BUCKETS,
      });

      this.registerMetric(this.httpInboundHistogram);
    }

    return this.httpInboundHistogram;
  }

  /**
   * Acquires configured outbound HTTP histogram.
   */
  public getHttpOutboundHistogram(): Histogram<MetricHttpLabel> {
    if (!this.httpOutboundHistogram) {
      this.httpOutboundHistogram = new Histogram({
        name: 'http_outbound_latency',
        help: 'Latency of outbound HTTP requests in milliseconds.',
        labelNames: this.metricConfig.METRIC_HTTP_DEFAULT_LABELS,
        buckets: this.metricConfig.METRIC_HTTP_DEFAULT_BUCKETS,
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
