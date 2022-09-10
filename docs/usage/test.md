# Testing

Since we are usually dealing with environment configurations, testing boilerplate may become extensive.

With that in mind, you may use the built-in `compile()` method provided at `AppModule` to create an application instance without serving it.

---

## Usage

Create your `*.service.spec.ts` file adding a `beforeAll()` hook to compile an application instance:

```ts
import { AppModule } from '@bechara/crux';

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

If you would like to customize what is compiled, you may use the any of the app booting options available at `boot()`.

You may run all your tests using:

```sh
pnpm test
```

Or a specific set by regex match:

```sh
pnpm test -- foo
```

---

[Back to title](../../README.md)
