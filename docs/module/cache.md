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

  @Cache({ ttl: 60_000 })
  @Get(':id')
  public getFoo(@Param('id') id: string): Promise<Foo> {
    return this.fooService.getFooById(id);
  }

}
```

---

[Back to title](../../README.md)
