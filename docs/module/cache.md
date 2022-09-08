# Cache Module

Allows caching inbound responses for paths decorated with `@Cache()`.

---

## Usage

Add the `@Cache()` to target controller method:

```ts
import { Cache, Controller, Get } from '@bechara/nestjs-core';

@Controller('foo')
export class FooController {

  public constructor(
    private readonly fooService: FooService,
  ) { }

  @Get(':id')
  @Cache({ ttl: 60_000 })
  public getFoo(@Param('id') id: string): Promise<Foo> {
    return this.fooService.getFooById(id);
  }

}
```

---

[Back to title](../../README.md)
