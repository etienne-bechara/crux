# Memory Module

Allow setting and reading keys from memory with configurable TTL.

---

## Usage

Import `MemoryModule` at your application, followed by injecting `MemoryService` at your target provider:

```ts
import { InternalServerErrorException, MemoryService } from '@bechara/crux';

@Injectable()
export class FooService {

  public constructor(
    private readonly memoryService: MemoryService,
  ) { }

  public getFoo(): unknown {
    const foo = this.memoryService.get('FOO');

    if (!foo) {
      throw new InternalServerErrorException('foo not available');
    }
  }

  public setFoo(params: unknown): void {
    const ttl = 5 * 60 * 1000; // 5 minutes
    this.memoryService.set('FOO', params, { ttl });
  }

}
```

---

[Back to title](../../README.md)
