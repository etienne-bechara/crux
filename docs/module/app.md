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
  disableScan: false,

  // Disables app.controller.ts
  disableStatus: false,

  // Disables app.filter.ts
  disableFilter: false,

  // Disables ClassSerializer
  disableSerializer: false,

  // Disables ValidationPipe
  disableValidator: false,

  // Disables all logging
  disableLogger: false,

  // Disables metrics register
  disableMetrics: false,

  // HTTP adapter port
  port: 8080,

  // HTTP adapter hostname
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
    HttpStatus.NOT_IMPLEMENTED,
    HttpStatus.BAD_GATEWAY,
    HttpStatus.SERVICE_UNAVAILABLE,
    HttpStatus.GATEWAY_TIMEOUT,
    HttpStatus.HTTP_VERSION_NOT_SUPPORTED,
  ],

  // Further options to pass to underlying adapter (Fastify)
  adapterOptions: { },

  // Object keys to be censored when logging
  sensitiveKeys: [
    'auth',
    'authentication',
    'authorization',
    'clientkey',
    'clientsecret',
    'key',
    'pass',
    'password',
  ],

  // Base options from NestJS modules
  imports: [ ],
  controllers: [ ],
  providers: [ ],
  exports: [ ],
});
```

---

[Back to title](../../README.md)
