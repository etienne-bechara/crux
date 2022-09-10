# Metric Module

Collect metrics based on [Prometheus](https://prometheus.io/).

Scraping is available at `/metrics` endpoint.

---

## Usage

To create you own metrics, use provided methods `getCounter()`, `getGauge()`, `getHistogram()` or `getSummary()`, from the `MetricService`.

```ts
import { Histogram, MetricService } from '@bechara/crux';

@Injectable()
export class FooService {

  public constructor(
    private readonly metricService: MetricService,
  ) {
    setup();
  }

  public setup(): void {
    this.metricService.getHistogram('foo_size', {
      help: 'Size of foo.',
      labelNames: [ 'foo', 'bar' ],
      buckets: [ 1, 3, 5, 8, 13 ],
    });
  }

  public readFoo(): Foo {
    // ...
    const histogram = this.metricService.getHistogram('foo_size');
    // ...
  }
}
```

---

[Back to title](../../README.md)
