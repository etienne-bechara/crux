# Test Module

Before proceeding, we recommend reading the official [NestJS testing documentation](https://docs.nestjs.com/fundamentals/testing#testing).

Since we are usually dealing with environment configurations, testing boilerplate may become extensive.

With that in mind, you may optionally use the built-in `createSandbox()` method provided in the package.

**Example**

```ts
import { TestingModuleBuilder } from '@nestjs/testing';
import { TestModule } from '@bechara/nestjs-core/dist/test';

TestModule.createSandbox({
  name: 'FooService',
  imports: [ FooModule ],
  configs: [ FooConfig ],

  descriptor: (testingBuilder: TestingModuleBuilder) => {
    let fooService: FooService;

    beforeAll(async () => {
      const testingModule = await testingBuilder.compile();
      fooService = testingModule.get(FooService);
    });

    describe('readById', () => {
      it('should read a foo entity', async () => {
        const foo = fooService.readById(1);
        expect(foo).toBe({ name: 'bob' });
      });
    });
  },

});
```

Write your tests as you usually do but inside the `descriptor` property, which will always take a function that returns the Nest testing builder.

The difference is that we also expose the `imports`, `controllers`, `providers` and `configs` properties which allows you to simulate the necessary injections.

You may run all your tests using:

```
npm test
```

Or a specific set by regex match:

```
npm test -- foo
```

---

[Back to title](../README.md)
