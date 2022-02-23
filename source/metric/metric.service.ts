import { Injectable } from '@nestjs/common';
import { collectDefaultMetrics, Metric, Registry } from 'prom-client';

@Injectable()
export class MetricService {

  private register: Registry;

  public constructor() {
    this.setupRegistry();
  }

  /**
   * Create Prometheus metrics registry.
   */
  private setupRegistry(): void {
    this.register = new Registry();

    collectDefaultMetrics({
      register: this.register,
    });
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
