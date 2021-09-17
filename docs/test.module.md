# Test Module

Since we are usually dealing with environment configurations, testing boilerplate may become extensive.

With that in mind, you may optionally use the built-in `compile()` method provided at `AppModule` to create an application instance without serving it.

**Example**

```ts
import { AppModule } from '@bechara/nestjs-core';

describe('FooService', () => {
  let fooService: FooService;

  beforeAll(async () => {
    const app = await AppModule.compile();
    fooService = app.get(FooService);
  });

  describe('readById', () => {
    it('should read a foo entity', async () => {
      const foo = fooService.readById(1);
      expect(foo).toBe({ name: 'bob' });
    });
  });
});
```

If you would like to customize what is compiled, you may user the any of the app booting options available at `boot()`. 

You may run all your tests using:

```sh
npm test
```

Or a specific set by regex match:

```sh
npm test -- foo
```

---

[Back to title](../README.md)
