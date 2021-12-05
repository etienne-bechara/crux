# Application Module

Acts as an entry point, wrapping other modules provided in this package as well as automatically requiring any `*.module.ts` file in the project source folder.

Upon start, it will serve an HTTP adapter based on [Fastify](https://www.fastify.io/).

The following custom enhancers will be globally applied:

- [app.timeout.interceptor.ts](../../source/app/app.interceptor/app.timeout.interceptor.ts) - Timeout interceptor to cancel running request that expires configured runtime.
- [app.logger.interceptor.ts](../../source/app/app.interceptor/app.logger.interceptor.ts) - Logger interceptor to print debugging information.
- [app.filter.ts](../../source/app/app.filter.ts) - Exception filter integrated witch logger service to standardize error outputs.

Plus these techniques as officially documented:

* [ClassSerializer](https://docs.nestjs.com/techniques/serialization#serialization) - Serialization interceptor to stringify responses.
* [ValidationPipe](https://docs.nestjs.com/techniques/validation#validation) - Validation pipe to make use of `class-validator` and `class-transformer` on requests DTOs.

---

## Environment Configuration

The following variables will be taken into account when booting the application:

Variable | Mandatory | Type | Default
:--- | :---: | :---: | :---
NODE_ENV | Yes | [AppEnvironment](source/app/app.enum/app.environment.ts) | `undefined`
APP_PORT | No | `number` | 8080
APP_HOSTNAME | No | `string` | 0.0.0.0
APP_GLOBAL_PREFIX | No | string | `undefined`
APP_TIMEOUT | No | `number` | 6000

---

## Module Options

When bootstrapping your application you may configure the following:

```ts
import { AppModule } from '@bechara/nestjs-core';

/**
 * Example values are the default.
 */
void AppModule.boot({

  // Changes default path to read .env files
  envPath: '.env',

  // Disables automatically importing *.module.ts files
  disableModuleScan: false,

  // Disables app.filter.ts
  disableFilters: false,

  // Disables ClassSerializer, app,logger.interceptor.ts
  // and app.timeout.interceptor.ts
  disableInterceptors: false,

  // Disables ValidationPipe
  disablePipes: false,

  // Disables all logging
  disableLogger: false,

  // HTTP adapter port
  port: 8080,

  // HTTP adapter hostmanem
  hostname: '0.0.0.0',

  // Global path prefix
  globalPrefix: '',

  // Time in milliseconds to trigger timeout interceptor
  timeout: 60 * 1000,

  // CORS options
  cors: {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  },

  // Which HTTP exceptions should be logged as errors
  httpErrors: [
    HttpStatus.INTERNAL_SERVER_ERROR,
  ],

  // Further options to pass to underlying adapter (Fastify)
  adapterOptions: { },

  // Base options from NestJS modules
  imports: [ ],
  controllers: [ ],
  providers: [ ],
  exports: [ ],
});
```

---

[Back to title](../../README.md)
