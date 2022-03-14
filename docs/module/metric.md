# Metric Module

Collect metrics based on [Prometheus](https://prometheus.io/).

By default it will automatically collect histograms of Node.js process, as well as inbound and outbound HTTP request latencies.

Scraping is available at `/metrics` endpoint.

---

## Usage

To create you own metrics, simply initiate them according to [prom-client](https://www.npmjs.com/package/prom-client) documentation and register it at `MetricService`:

```ts
import { Histogram, MetricService } from '@bechara/nestjs-core';

@Injectable()
export class FooService {

  private fooHistogram: Histogram;

  public constructor(
    private readonly metricService: MetricService,
  ) {
    setup();
  }

  public setup(): void {
    this.fooHistogram = new Histogram({
      name: 'foo_data',
      help: 'Foo data.',
      labelNames: [ 'foo', 'bar' ],
      buckets: [ 1, 3, 5, 8, 13 ],
    });

    this.metricService.registerMetric(this.fooHistogram);
  }

}
```

---

[Back to title](../../README.md)
