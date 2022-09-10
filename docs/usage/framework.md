# Framework Usage

Uses `AppModule.boot()` to fully instantiate an application server.

---

## Installation

1\. Create and initialize a new Node.js project, then install Typescript dependencies as well as this package.

We recommend using `pnpm` as you package manager, and `ts-node-dev` as your live reload tool:

```sh
mkdir my-project
cd my-project

git init
npm init -y

npm i -g pnpm
pnpm i -DE typescript @types/node ts-node-dev
pnpm i -E @bechara/crux

tsc --init
```

2\. Create a `main.ts` file at `/source` with the following content:

```ts
// /source/main.ts
import { AppModule } from '@bechara/crux';

void AppModule.boot();
```

3\. Add the following `dev` script at your `package.json`:

```json
{
  "dev": "tsnd --exit-child --rs --watch *.env --inspect=0.0.0.0:9229 ./test/main.ts"
}
```

4\. Boot the application using:

```bs
pnpm dev
```

You may validate its functionality by sending an HTTP request to `GET /`.

The response shall be an object containing your machine information:

```json
{
  "system": {
    "version": "Windows 10 Pro",
    "type": "Windows_NT",
    "release": "10.0.19041",
    "architecture": "x64",
    "endianness": "LE",
    "uptime": 614041
  }
  // ...
}
```

---

## Development

Usage of this framework follows [NestJS Documentation](https://docs.nestjs.com/) with some additions.

Recommended core concepts before proceeding are:

- [NestJS Intro](https://docs.nestjs.com/)
- [NestJS Modules](https://docs.nestjs.com/modules)
- [NestJS Controllers](https://docs.nestjs.com/controllers)
- [NestJS Providers](https://docs.nestjs.com/providers)

When developing, you should be aware of the following differences:

1\. All imports should come from `@bechara/crux` instead of `@nestjs/common` and `@nestjs/core`.

Instead of:

```ts
import { Injectable } from '@nestjs/common';
```

Use:

```ts
import { Injectable } from '@bechara/crux';
```

2\. All `*.module.ts` files at your source directory will be automatically loaded by the wrapper at `main.ts`, there is no need to add them to a global module.

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
import { AppModule } from '@bechara/crux';

// Foo, Bar and Baz module will be automatically
// loaded as long as they are inside source and
// named *.module.ts
void AppModule.boot();
```

---

[Back to title](../../README.md)
