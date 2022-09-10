# Trace Module

Collect traces based on [Open Telemetry](https://opentelemetry.io/docs/), and propagates them using B3 standards headers.

By default it will automatically parse context from inbound HTTP headers to create current request span.

Child spans are generated for all outbound HTTP requests, an you may create new spans by using `startSpan()` from  `TraceService`:

---

## Usage

```ts
import { TraceService } from '@bechara/crux';

@Injectable()
export class FooService {

  public constructor(
    private readonly traceService: TraceService,
  ) { }

  public readFoo(): Foo {
    const span = this.traceService.startSpan('Reading Foo');
    // ...
    span.close();
  }
}
```

---

[Back to title](../../README.md)
