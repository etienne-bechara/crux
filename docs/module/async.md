# Async Module

Offers a set of utility functions to handle Promises, including sleep, retry and throttling.

Refer to [AsyncService](../../source/async/async.service.ts) for further details.

---

## Usage

Import `AsyncModule` at your application, followed by injecting `AsyncService` at your target provider:

```ts
import { AsyncService, HttpService } from '@bechara/nestjs-core';

@Injectable()
export class FooService {

  public constructor(
    private readonly asyncService: AsyncService,
    private readonly httpService: HttpService,
  ) { }

  public async readFooDelayed(): Promise<unknown> {
    const foo = await this.httpService.get('foo');
    await this.asyncService.sleep(5000); // 5 seconds
    return foo;
  }

  public async readFooOrTimeout(): Promise<unknown> {
    const timeout = 5000; // 5 seconds
    return this.asyncService.resolveOrTimeout(this.httpService.get('foo'), timeout);
  }

  public async readFooWithRetry(): Promise<unknown> {
    return this.asyncService.retryOnException({
      method: () => this.httpService.get('foo'),
      retries: 5,
      timeout: 2 * 60 * 1000, // 2 minutes,
      delay: 500, // 500 ms
    });
  }

}
```

---

[Back to title](../../README.md)
