import { forwardRef, Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { collectDefaultMetrics, Counter, CounterConfiguration, Gauge, GaugeConfiguration, Histogram, HistogramConfiguration, Metric, Registry, Summary, SummaryConfiguration } from 'prom-client';
import { compress } from 'snappyjs';
import { setTimeout } from 'timers/promises';

import { AppConfig } from '../app/app.config';
import { AppMetric } from '../app/app.enum';
import { HttpService } from '../http/http.service';
import { LogService } from '../log/log.service';
import { PromiseService } from '../promise/promise.service';
import { MetricConfig } from './metric.config';
import { MetricDataDto } from './metric.dto.out';
import { MetricDataType, MetricHttpStrategy } from './metric.enum';
import { MetricHttpDurationParams, MetricMessage } from './metric.interface';
import { MetricMessageProto } from './metric.proto';

@Injectable()
export class MetricService {

  private register!: Registry;
  private metrics: Map<string, Metric<any>> = new Map();
  private httpService!: HttpService;

  public constructor(
    private readonly appConfig: AppConfig,
    @Inject(forwardRef(() => PromiseService))
    private readonly promiseService: PromiseService,
    private readonly logService: LogService,
    private readonly metricConfig: MetricConfig,
  ) {
    this.setupRegistry();
    this.setupMetrics();
    void this.setupPush();
  }

  /**
   * Acquires configured metric URL giving priority to environment variable.
   */
  private buildMetricUrl(): string | undefined {
    const { metrics } = this.appConfig.APP_OPTIONS || { };
    const { url } = metrics;
    return this.metricConfig.METRIC_URL || url;
  }

  /**
   * Create Prometheus metrics registry and start collection defaults.
   */
  private setupRegistry(): void {
    const { name: job, instance, metrics } = this.appConfig.APP_OPTIONS || { };
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
    const { httpStrategy, httpPercentiles, httpBuckets } = metrics;

    if (httpStrategy === MetricHttpStrategy.SUMMARY) {
      this.getSummary(AppMetric.HTTP_REQUEST_DURATION, {
        help: 'Duration of inbound HTTP requests in seconds.',
        labelNames: [ 'traffic', 'method', 'host', 'path', 'code', 'cache' ],
        percentiles: httpPercentiles,
      });
    }
    else {
      this.getHistogram(AppMetric.HTTP_REQUEST_DURATION, {
        help: 'Duration of inbound HTTP requests in seconds.',
        labelNames: [ 'traffic', 'method', 'host', 'path', 'code', 'cache' ],
        buckets: httpBuckets,
      });
    }
  }

  /**
   * Configures metric pushing based on remote write.
   */
  private async setupPush(): Promise<void> {
    const metricUrl = this.buildMetricUrl();
    if (!metricUrl) return;

    const { metrics } = this.appConfig.APP_OPTIONS || { };
    const { username, password, pushInterval } = metrics;

    this.httpService = new HttpService({
      username: this.metricConfig.METRIC_USERNAME ?? username,
      password: this.metricConfig.METRIC_PASSWORD ?? password,
    }, this.appConfig, this.promiseService);

    while (true) {
      await setTimeout(pushInterval);

      try {
        const currentMetrics = await this.readMetricsJson();
        const timestamp = Date.now();

        const messageData: MetricMessage = {
          timeseries: currentMetrics.flatMap((m) => m.values.map((v) => ({
            labels: [
              { name: '__name__', value: v.metricName || m.name },
              ...Object.keys(v.labels || { }).map((k) => ({ name: k, value: String(v.labels[k]) })),
            ],
            samples: [
              { value: v.value, timestamp },
            ],
          }))),
        };

        const message = new MetricMessageProto(messageData);
        const buffer: Buffer = MetricMessageProto.encode(message).finish() as any;

        await this.httpService.post(metricUrl, {
          headers: {
            'content-type': 'application/x-protobuf',
          },
          body: compress(buffer),
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
      case MetricDataType.COUNTER: {
        metric = new Counter({ name, ...params } as CounterConfiguration<any>);
        break;
      }

      case MetricDataType.GAUGE: {
        metric = new Gauge({ name, ...params } as GaugeConfiguration<any>);
        break;
      }

      case MetricDataType.HISTOGRAM: {
        metric = new Histogram({ name, ...params } as HistogramConfiguration<any>);
        break;
      }

      case MetricDataType.SUMMARY: {
        metric = new Summary({ name, ...params } as SummaryConfiguration<any>);
        break;
      }
    }

    this.register.registerMetric(metric);
    this.metrics.set(name, metric);

    return metric;
  }

  /**
   * Read metrics in Prometheus string format.
   */
  public async readMetrics(): Promise<string> {
    const { metrics } = this.appConfig.APP_OPTIONS || { };
    const { defaultFilter } = metrics;

    let currentMetrics = await this.register.metrics();

    if (defaultFilter) {
      const reportMetrics = [ ...defaultFilter, ...this.metrics.keys() ];
      const metricsArray = currentMetrics.split('\n');

      const filteredMetrics = metricsArray.filter((m) => {
        for (const filter of reportMetrics) {
          if (m.startsWith('#') || m.startsWith(filter)) {
            return true;
          }
        }
      });

      currentMetrics = filteredMetrics.join('\n');
    }

    return currentMetrics;
  }

  /**
   * Read metrics in Prometheus JSON format.
   */
  public async readMetricsJson(): Promise<MetricDataDto[]> {
    const { metrics } = this.appConfig.APP_OPTIONS || { };
    const { defaultFilter } = metrics;

    let currentMetrics: MetricDataDto[] = await this.register.getMetricsAsJSON() as any;

    if (defaultFilter) {
      const reportMetrics = new Set([ ...defaultFilter, ...this.metrics.keys() ]);
      currentMetrics = currentMetrics.filter((m) => reportMetrics.has(m.name));
    }

    return currentMetrics;
  }

  /**
   * Observes a new value into http metric.
   * @param params
   */
  public observeHttpDuration(params: MetricHttpDurationParams): void {
    const { traffic, method, host, path, code: rawCode, cache, duration } = params;
    const { metrics } = this.appConfig.APP_OPTIONS || { };
    const { httpCodeBin } = metrics;

    const code = rawCode && httpCodeBin
      ? `${Math.floor(rawCode / 100)}xx`
      : String(rawCode) || '';

    this.getHttpMetric().labels(traffic, method, host, path, code, cache).observe(duration);
  }

  /**
   * Acquires the HTTP metric collector which might be either
   * a summary or histogram depending on app configuration.
   */
  private getHttpMetric<T extends string = 'traffic' | 'method' | 'host' | 'path' | 'code' | 'cache' >(
  ): Summary<T> | Histogram<T> {
    const { metrics } = this.appConfig.APP_OPTIONS || { };
    const { httpStrategy } = metrics;

    return httpStrategy === MetricHttpStrategy.SUMMARY
      ? this.getSummary(AppMetric.HTTP_REQUEST_DURATION)
      : this.getHistogram(AppMetric.HTTP_REQUEST_DURATION);
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
