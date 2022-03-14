import { Injectable } from '@nestjs/common';
import got from 'got';
import { collectDefaultMetrics, Histogram, Metric, Registry } from 'prom-client';

import { AppConfig } from '../app/app.config';
import { AsyncService } from '../async/async.service';
import { LoggerService } from '../logger/logger.service';
import { MetricConfig } from './metric.config';

@Injectable()
export class MetricService {

  private register: Registry;
  private httpInboundHistogram: Histogram<any>;
  private httpOutboundHistogram: Histogram<any>;

  public constructor(
    private readonly appConfig: AppConfig,
    private readonly asyncService: AsyncService,
    private readonly metricConfig: MetricConfig,
    private readonly loggerService: LoggerService,
  ) {
    this.setupRegistry();
    void this.setupPushgateway();
  }

  /**
   * Create Prometheus metrics registry and built-in histograms.
   */
  private setupRegistry(): void {
    const { metrics } = this.appConfig.APP_OPTIONS || { };
    const { job, defaultPrefix, defaultLabels, defaultBuckets } = metrics;
    const environment = this.appConfig.NODE_ENV;

    this.register = new Registry();
    this.register.setDefaultLabels({ job, environment });

    collectDefaultMetrics({
      register: this.register,
      prefix: defaultPrefix,
      labels: defaultLabels,
      gcDurationBuckets: defaultBuckets,
    });
  }

  /**
   * When a pushgateway host is provided, configures a
   * permanent push job to it.
   */
  private async setupPushgateway(): Promise<void> {
    const { metrics } = this.appConfig.APP_OPTIONS || { };
    const { job, pushgatewayInterval, pushgatewayReset } = metrics;
    const { pushgatewayUrl, pushgatewayUsername, pushgatewayPassword } = metrics;

    const pushgatewayTarget = this.metricConfig.METRIC_PUSHGATEWAY_URL || pushgatewayUrl;
    if (!pushgatewayTarget) return;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      await this.asyncService.sleep(pushgatewayInterval);

      try {
        const currentMetrics = await this.readMetrics();

        if (pushgatewayReset) {
          this.register.resetMetrics();
        }

        await got.post(`${pushgatewayTarget}/metrics/job/${job}`, {
          body: Buffer.from(currentMetrics, 'utf-8'),
          username: this.metricConfig.METRIC_PUSHGATEWAY_USERNAME || pushgatewayUsername,
          password: this.metricConfig.METRIC_PUSHGATEWAY_PASSWORD || pushgatewayPassword,
          retry: 3,
        });

        this.loggerService.debug('Metrics successfully pushed to gateway');
      }
      catch (e) {
        this.loggerService.warning('Failed to push to metrics to gateway', e as Error);
      }
    }
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
