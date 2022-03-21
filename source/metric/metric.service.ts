import { Injectable } from '@nestjs/common';
import { collectDefaultMetrics, Histogram, Metric, metric, Registry } from 'prom-client';

import { AppConfig } from '../app/app.config';
import { HttpConfig } from '../http/http.config';
import { HttpService } from '../http/http.service';
import { LogService } from '../log/log.service';
import { MetricConfig } from './metric.config';

@Injectable()
export class MetricService {

  private register: Registry;
  private httpInboundHistogram: Histogram<any>;
  private httpOutboundHistogram: Histogram<any>;

  public constructor(
    private readonly appConfig: AppConfig,
    private readonly httpConfig: HttpConfig,
    private readonly logService: LogService,
    private readonly metricConfig: MetricConfig,
  ) {
    this.setupRegistry();
    void this.setupPushgateway();
  }

  /**
   * Create Prometheus metrics registry and built-in histograms.
   */
  private setupRegistry(): void {
    const { job, instance, metrics } = this.appConfig.APP_OPTIONS || { };
    const { defaultPrefix, defaultLabels, defaultBuckets } = metrics;
    const environment = this.appConfig.NODE_ENV;

    this.register = new Registry();
    this.register.setDefaultLabels({ job, instance, environment });

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
    const { job, instance, metrics } = this.appConfig.APP_OPTIONS || { };
    const { pushInterval: pushgatewayInterval } = metrics;
    const { url, username, password } = metrics;

    const pushgatewayUrl = this.metricConfig.METRIC_URL || url;
    if (!pushgatewayUrl) return;

    const httpService = new HttpService({
      name: 'MetricModule',
      silent: true,
      prefixUrl: pushgatewayUrl,
      username: this.metricConfig.METRIC_USERNAME ?? username,
      password: this.metricConfig.METRIC_PASSWORD ?? password,
    }, this.httpConfig, this.logService, null);

    // eslint-disable-next-line no-constant-condition
    while (true) {
      await new Promise((r) => setTimeout(r, pushgatewayInterval));

      try {
        const currentMetrics = await this.readMetrics();

        await httpService.post('metrics/job/:job/instance/:instance', {
          replacements: {
            job: job || 'unknown',
            instance: instance || 'unknown',
          },
          body: Buffer.from(currentMetrics, 'utf-8'),
          retryLimit: 2,
        });
      }
      catch (e) {
        this.logService.warning('Failed to push to metrics to gateway', e as Error);
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

  public readMetrics(): Promise<string>;
  public readMetrics(json?: boolean): Promise<metric[]>;
  /**
   * Read metrics in standard Prometheus string format.
   * @param json
   */
  public readMetrics(json?: boolean): Promise<string | metric[]> {
    return json
      ? this.register.getMetricsAsJSON()
      : this.register.metrics();
  }

  /**
   * Registers target metric.
   * @param params
   */
  public registerMetric(params: Metric<string>): void {
    this.register.registerMetric(params);
  }

}
