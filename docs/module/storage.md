# Storage Module

Allow setting and reading keys from memory with configurable TTL.

---

## Usage

Import `StorageModule` at your application, followed by injecting `StorageService` at your target provider:

```ts
import { InternalServerErrorException, StorageService } from '@bechara/nestjs-core';

@Injectable()
export class FooService {

  public constructor(
    private readonly storageService: StorageService,
  ) { }

  public getFoo(): unknown {
    const foo = this.storageService.getKey('FOO');

    if (!foo) {
      throw new InternalServerErrorException('foo not available');
    }
  }

  public setFoo(params: unknown): void {
    const ttl = 5 * 60 * 1000; // 5 minutes
    this.storageService.setKey('FOO', params, { ttl });
  }

}
```

---

[Back to title](../../README.md)
