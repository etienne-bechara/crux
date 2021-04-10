# Usage

This package usage follows [NestJS Documentation](https://docs.nestjs.com/) with some additions.

Recommended core concepts before proceeding are:

* [NestJS Intro](https://docs.nestjs.com/)
* [NestJS Modules](https://docs.nestjs.com/modules)
* [NestJS Controllers](https://docs.nestjs.com/controllers)
* [NestJS Providers](https://docs.nestjs.com/providers)

When developing, you should be aware of the following differences:

1\. All imports should come from `@bechara/nestjs-core` instead of `@nestjs/common` and `@nestjs/core`.

**Example**

Instead of:

```ts
import { Injectable } from '@nestjs/common';
```

Use:

```ts
import { Injectable } from '@bechara/nestjs-core';
```


2\. All `*.module.ts` files at your source directory will be automatically loaded by the wrapper at `main.ts`, there is no need to add them to a global module.

**Example**

Instead of:

```ts
import { Module } from '@nestjs/common';
import { FooModule } from './foo/foo.module';
import { BarModule } from './bar/bar.module';
import { BazModule } from './baz/baz.module';

@Global()
@Module({
  imports: [
    FooModule,
    BarModule,
    BazModule,
  ],
})
export class AppModule { }
```

Use:

```ts
import { AppModule } from '@bechara/nestjs-core';

// Foo, Bar and Baz module will be automatically
// loaded as long as they are inside source and
// named *.module.ts
void AppModule.bootServer();
```

---

[Next: Application Module](app.module.md)

[Back to title](../README.md)
