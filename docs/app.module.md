# Application Module

Acts as an entry point, wrapping other modules provided in this package as well as automatically requiring any `*.module.ts` file in the project source folder.

The following custom enhancers will be globally applied:

* [app.middleware.ts](source/app/app.middleware.ts) - Middleware to extract request IP, User Agent and JWT payload.
* [app.timeout.interceptor.ts](source/app/app.interceptor/app.timeout.interceptor.ts) - Timeout interceptor to cancel running request that expires configured runtime.
* [app.logger.interceptor.ts](source/app/app.interceptor/app.logger.interceptor.ts) - Logger interceptor to print debugging information.
* [app.filter.ts](source/app/app.filter.ts) - Exception filter integrated witch logger service to standardize error outputs.

Plus these techniques as officially documented:

* [ClassSerializer](https://docs.nestjs.com/techniques/serialization#serialization) - Serialization interceptor to stringify responses.
* [ValidationPipe](https://docs.nestjs.com/techniques/validation#validation) - Validation pipe to make use of `class-validator` and `class-transformer` on requests DTOs.

## Environment Configuration

The following variables will be taken into account when booting the application:

Variable | Mandatory | Type | Default
:--- | :---: | :---: | :---
NODE_ENV | Yes | [AppEnvironment](source/app/app.enum/app.environment.ts) | `undefined`
APP_PORT | No | number | 8080
APP_GLOBAL_PREFIX | No | string | `undefined`


## Module Options

When bootstrapping your application you may configure the following:

```ts
import { AppModule } from '@bechara/nestjs-core';

/**
 * Example values are the default.
 */
void AppModule.bootServer({

  // Changes default path to read .env files
  envPath: '.env',

  // Disables automatically importing *.module.ts files
  disableModuleScan: false,

  // Disables automatically importing *.config.ts files
  disableConfigScan: false,

  // Disables app.filter.ts
  disableFilters: false,

  // Disables ClassSerializer, app,logger.interceptor.ts
  // and app.timeout.interceptor.ts
  disableInterceptors: false,

  // Disables ValidationPipe
  disablePipes: false,

  // Configuration providers to import - see 'Config Module'
  configs: [ ],

  // Modules to import and export globally
  modules: [ ],

  // Base options from NestJS modules
  imports: [ ],
  controllers: [ ],
  providers: [ ],
  exports: [ ],

  // Time in milliseconds to trigger timeout interceptor
  timeout: 90 * 1000,

  // Maximum request JSON body size
  jsonLimit: '10mb',

  // CORS options
  cors: {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  }
});
```

---

[Next: Configuration Module](config.module.md)

[Back to title](../README.md)
