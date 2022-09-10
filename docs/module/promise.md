# Promise Module

Offers a set of utility functions to handle Promises, including sleep, retry and throttling.

Refer to [PromiseService](../../source/promise/promise.service.ts) for further details.

---

## Usage

Import `PromiseModule` at your application, followed by injecting `PromiseService` at your target provider:

```ts
import { PromiseService, HttpService } from '@bechara/crux';

@Injectable()
export class FooService {

  public constructor(
    private readonly promiseService: PromiseService,
    private readonly httpService: HttpService,
  ) { }

  public async readFooDelayed(): Promise<unknown> {
    const foo = await this.httpService.get('foo');
    await this.promiseService.sleep(5000); // 5 seconds
    return foo;
  }

  public async readFooOrTimeout(): Promise<unknown> {
    const timeout = 5000; // 5 seconds
    return this.promiseService.resolveOrTimeout(this.httpService.get('foo'), timeout);
  }

  public async readFooWithRetry(): Promise<unknown> {
    return this.promiseService.retryOnRejection({
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
