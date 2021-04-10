# Util Module

Offers a set of methods that supports other modules in this package, but may also use be used by other applications.

- [util.module.ts](source/util/util.module.ts) - Static utilities (pre-boot).
- [util.service.ts](source/util/util.service.ts) - Injectable utilities (post-boot).

**Example**

```ts
import { UtilService } from '@bechara/nestjs-core';

@Injectable()
export class FooService {

  public constructor(
    private readonly fooRepository: Repository<FooEntity>,
    private readonly utilService: UtilService,
  ) { }

  public async readFooById(id: number) {
    return this.utilService.retryOnException({
      method: () => this.fooRepository.readById(id),
      retries: 5,
    })
  }
}
```