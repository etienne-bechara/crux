# Application Module

Acts as an entry point, wrapping other modules provided in this package as well as automatically requiring any `*.module.ts` file in the project source folder.

Upon start, it will serve an HTTP adapter based on [Fastify](https://www.fastify.io/).

The following custom enhancers will be globally applied:

- [app.interceptor.ts](../../source/app/app.interceptor.ts) - Timeout interceptor to cancel running request that expires configured runtime.
- [app.filter.ts](../../source/app/app.filter.ts) - Exception filter integrated with logger service to standardize error outputs.

Plus these techniques as officially documented:

* [ClassSerializer](https://docs.nestjs.com/techniques/serialization#serialization) - Serialization interceptor to stringify responses.
* [ValidationPipe](https://docs.nestjs.com/techniques/validation#validation) - Validation pipe to make use of `class-validator` and `class-transformer` on requests DTOs.

---

## Environment Configuration

The following variables will be taken into account when booting the application:

Variable | Mandatory | Type
:--- | :---: | :---:
NODE_ENV | Yes | [AppEnvironment](source/app/app.enum/app.environment.ts)

---

## Module Options

When booting your application, you may configure options according to [AppBootOptions](../../source/app/app.interface.ts):

```ts
import { AppModule } from '@bechara/nestjs-core';

void AppModule.boot({ /* See AppBootOptions */ });
```

Provided options will be merged with [defaults](../../source/app/app.config.ts).

---

[Back to title](../../README.md)
