/* eslint-disable no-constant-condition */
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { collectDefaultMetrics, Counter, CounterConfiguration, Gauge, GaugeConfiguration, Histogram, HistogramConfiguration, Metric, Registry, Summary, SummaryConfiguration } from 'prom-client';
import { Type } from 'protobufjs';
import { compress } from 'snappy';
import { setTimeout } from 'timers/promises';

import { AppConfig } from '../app/app.config';
import { AppMetric } from '../app/app.enum';
import { HttpService } from '../http/http.service';
import { LogService } from '../log/log.service';
import { MetricConfig } from './metric.config';
import { MetricData } from './metric.dto';
import { MetricDataType, MetricPushStrategy } from './metric.enum';
import { MetricPushTimeseries } from './metric.interface';
import MetricProto from './metric.proto';

@Injectable()
export class MetricService {

  private register: Registry;
  private metrics: Map<string, Metric<any>> = new Map();
  private httpService: HttpService;

  public constructor(
    private readonly appConfig: AppConfig,
    private readonly logService: LogService,
    private readonly metricConfig: MetricConfig,
  ) {
    this.setupRegistry();
    this.setupMetrics();
    this.setupPush();
  }

  /**
   * Acquires configured metric URL giving priority to environment variable.
   */
  private buildMetricUrl(): string {
    const { metrics } = this.appConfig.APP_OPTIONS || { };
    const { url } = metrics;
    return this.metricConfig.METRIC_URL || url;
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
   * Setup custom metrics used by application.
   */
  private setupMetrics(): void {
    const { metrics } = this.appConfig.APP_OPTIONS || { };
    const { httpDurationBuckets } = metrics;

    this.getHistogram(AppMetric.HTTP_DURATION, {
      help: 'Duration of inbound HTTP requests in seconds.',
      labelNames: [ 'traffic', 'method', 'host', 'path', 'code' ],
      buckets: httpDurationBuckets,
    });
  }

  /**
   * Configures metric pushing which may be based
   * on pushgateway or remote write.
   */
  private setupPush(): void {
    const metricUrl = this.buildMetricUrl();
    if (!metricUrl) return;

    const { metrics } = this.appConfig.APP_OPTIONS || { };
    const { username, password, pushStrategy } = metrics;

    this.httpService = new HttpService({
      name: 'MetricModule',
      username: this.metricConfig.METRIC_USERNAME ?? username,
      password: this.metricConfig.METRIC_PASSWORD ?? password,
    }, this.appConfig);

    pushStrategy === MetricPushStrategy.PUSHGATEWAY
      ? void this.setupPushgateway()
      : void this.setupRemoteWrite();
  }

  /**
   * Push metrics to a Prometheus Pushgateway.
   */
  private async setupPushgateway(): Promise<void> {
    const { job, instance, metrics } = this.appConfig.APP_OPTIONS || { };
    const { pushInterval } = metrics;
    const metricUrl = this.buildMetricUrl();

    while (true) {
      await setTimeout(pushInterval);

      try {
        const currentMetrics = await this.readMetrics();

        await this.httpService.post(metricUrl, {
          replacements: {
            job: job || 'unknown',
            instance: instance || 'unknown',
          },
          body: Buffer.from(currentMetrics, 'utf8'),
          retryLimit: 2,
        });
      }
      catch (e) {
        this.logService.error('Failed to push metrics', e as Error);
      }
    }
  }

  /**
   * Push metrics according to Prometheus remote write specification.
   */
  private async setupRemoteWrite(): Promise<void> {
    const { metrics } = this.appConfig.APP_OPTIONS || { };
    const { pushInterval } = metrics;
    const metricUrl = this.buildMetricUrl();

    const timeseriesProto: Type = MetricProto.prometheus.WriteRequest;

    while (true) {
      await setTimeout(pushInterval);

      try {
        const currentMetrics = await this.readMetricsJson();

        const timeseries: MetricPushTimeseries = {
          timeseries: currentMetrics.flatMap((m) => m.values.map((v) => ({
            labels: [
              { name: '__name__', value: m.name },
              ...Object.keys(v.labels || { }).map((k) => ({ name: k, value: String(v.labels[k]) })),
            ],
            samples: [
              {
                value: v.value,
                timestamp: Date.now(),
              },
            ],
          }))),
        };

        const buffer: Buffer = timeseriesProto.encode(timeseries).finish() as any;

        await this.httpService.post(metricUrl, {
          headers: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'content-type': 'application/vnd.google.protobuf',
          },
          body: await compress(buffer),
          retryLimit: 2,
        });
      }
      catch (e) {
        this.logService.error('Failed to push metrics', e as Error);
      }
    }
  }

  /**
   * Gets metric by name creating if necessary.
   * @param type
   * @param name
   * @param params
   */
  private getMetric(type: MetricDataType, name: string, params: any): any {
    let metric = this.metrics.get(name);
    if (metric) return metric;

    if (!params) {
      throw new InternalServerErrorException(`cannot get metric ${name} since it was never initialized`);
    }

    switch (type) {
      case MetricDataType.COUNTER:
        metric = new Counter({ name, ...params } as CounterConfiguration<any>);
        break;

      case MetricDataType.GAUGE:
        metric = new Gauge({ name, ...params } as GaugeConfiguration<any>);
        break;

      case MetricDataType.HISTOGRAM:
        metric = new Histogram({ name, ...params } as HistogramConfiguration<any>);
        break;

      case MetricDataType.SUMMARY:
        metric = new Summary({ name, ...params } as SummaryConfiguration<any>);
        break;
    }

    this.register.registerMetric(metric);
    this.metrics.set(name, metric);

    return metric;
  }

  /**
   * Read metrics in Prometheus string format.
   */
  public readMetrics(): Promise<string> {
    return this.register.metrics();
  }

  /**
   * Read metrics in Prometheus JSON format.
   */
  public readMetricsJson(): Promise<MetricData[]> {
    return this.register.getMetricsAsJSON() as any;
  }

  /**
   * Gets or create a counter by name.
   * Counters go up, and reset when the process restarts.
   * @param name
   * @param params
   */
  public getCounter<T extends string>(
    name: string, params?: Omit<CounterConfiguration<string>, 'name'>,
  ): Counter<T> {
    return this.getMetric(MetricDataType.COUNTER, name, params);
  }

  /**
   * Gets or create a gauge by name.
   * Gauges can go up or down, and reset when the process restarts.
   * @param name
   * @param params
   */
  public getGauge<T extends string>(
    name: string, params?: Omit<GaugeConfiguration<string>, 'name'>,
  ): Gauge<T> {
    return this.getMetric(MetricDataType.GAUGE, name, params);
  }

  /**
   * Gets or create a histogram by name.
   * Histograms track sizes and frequency of events.
   * @param name
   * @param params
   */
  public getHistogram<T extends string>(
    name: string, params?: Omit<HistogramConfiguration<string>, 'name'>,
  ): Histogram<T> {
    return this.getMetric(MetricDataType.HISTOGRAM, name, params);
  }

  /**
   * Gets or create a summary by name.
   * Summaries calculate percentiles of observed values.
   * @param name
   * @param params
   */
  public getSummary<T extends string>(
    name: string, params?: Omit<SummaryConfiguration<string>, 'name'>,
  ): Summary<T> {
    return this.getMetric(MetricDataType.SUMMARY, name, params);
  }

}
