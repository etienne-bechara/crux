# CRUX
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=crux&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=crux)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=crux&metric=coverage)](https://sonarcloud.io/summary/new_code?id=crux)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=crux&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=crux)
[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=crux&metric=reliability_rating)](https://sonarcloud.io/summary/new_code?id=crux)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=crux&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=crux)

A Node.js opinionated packaged framework intended for backend projects.

- Framework: [NestJS](https://docs.nestjs.com/)
- HTTP Server: [Fastify](https://www.fastify.io/docs/latest/)
- HTTP Client: [Fetch](https://nodejs.org/dist/latest-v18.x/docs/api/globals.html#fetch)
- Caching: [ioredis](https://www.npmjs.com/package/ioredis) (distributed) or in-memory (local)
- ORM: [MikroORM](https://mikro-orm.io/docs/installation)
- Swagger: [Redoc](https://github.com/mxarc/nestjs-redoc)
- Logs: [Loki](https://grafana.com/docs/loki/latest/api/)
- Metrics: [Prometheus](https://github.com/siimon/prom-client)
- Tracing: [Tempo](https://grafana.com/docs/tempo/latest/api_docs/) with [OpenTelemetry](https://github.com/open-telemetry/opentelemetry-js)

---

## Disclaimer

I create this framework since I often found myself recreating similar boilerplates for distributed stateless backend projects with database access.

It is heavily opinionated and I strongly recommend that it should be treated as a reference to create it own instead of production ready product. 

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

The response shall be successful with a `204` status code.

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

## Application Module

Acts as an entry point, wrapping other modules provided in this package as well as automatically requiring any `*.module.ts` file in the project source folder.

Upon start, it will serve an HTTP adapter based on [Fastify](https://www.fastify.io/).

The following custom enhancers will be globally applied:

- [app.interceptor.ts](source/app/app.interceptor.ts) - Timeout interceptor to cancel running request that expires configured runtime.
- [app.filter.ts](source/app/app.filter.ts) - Exception filter integrated with log service to standardize error outputs.

Plus these techniques as officially documented:

* [ClassSerializer](https://docs.nestjs.com/techniques/serialization#serialization) - Serialization interceptor to stringify responses.
* [ValidationPipe](https://docs.nestjs.com/techniques/validation#validation) - Validation pipe to make use of `class-validator` and `class-transformer` on requests DTOs.


### Environment Configuration

The following variables will be taken into account when booting the application:

Variable | Mandatory | Type
:--- | :---: | :---:
NODE_ENV | Yes | [AppEnvironment](source/app/app.enum/app.environment.ts)


### Module Options

When booting your application, you may configure options according to [AppBootOptions](source/app/app.interface.ts):

```ts
import { AppModule } from '@bechara/crux';

void AppModule.boot({ /* See AppBootOptions */ });
```

Provided options will be merged with [defaults](source/app/app.config.ts).

---

## Configuration Module

Serves the purpose of allowing asynchronous secret population, it works along with `*.config.ts` files that contains the definition of injectable class.

Decorate a class with `@Config()` in order to mark it as a configuration definition. It will be available as a regular provider for NestJS injection.

Any property decorated with `@InjectSecret()` will have its value extracted from `process.env` and added to the class.


### Usage

Create a `*.config.ts` file declaring you configuration class with `@Config()` and decorate target properties with `@InjectSecret()`:

```ts
import { Config, InjectSecret } from '@bechara/crux';

@Config()
export class FooConfig {

  @InjectSecret()
  FOO_API_URL: string;

  // Use 'key' if the env variable has
  // a different name than the property.
  @InjectSecret({ key: 'foo_authorization' })
  FOO_API_KEY: string;

  // Use 'fallback' to set a base value
  @InjectSecret({ fallback: 15 })
  FOO_API_MAX_CONCURRENCY: number;

}
```

The framework also allows decoration of properties using `class-validator` and `class-transformer` to enforce validation of the value before initialization:

```ts
import { Config, InjectSecret, IsUrl, IsString, Length, ToNumber } from '@bechara/crux';

@Config()
export class FooConfig {

  @InjectSecret()
  @IsUrl()
  FOO_API_URL: string;

  @InjectSecret({ key: 'foo_authorization' })
  @IsString() @Length(36)
  FOO_API_KEY: string;

  @InjectSecret({ fallback: '15' })
  @ToNumber()
  @IsNumber()
  FOO_API_MAX_CONCURRENCY: number;

}
```

Finally, to use the secrets, you must add the configuration class to the array of providers of your module and inject it into your service:

```ts
@Injectable()
export class FooService {

  public constructor(
    private readonly fooConfig: FooConfig,
  ) { }

  public async readFooById(id: number) {
    const maxConcurrency = this.fooConfig.FOO_API_MAX_CONCURRENCY;
    console.log(maxConcurrency);
  }
}
```

---

## Context Module

In order to access request specific data inside a provider, NestJS offers the `REQUEST` scope option during dependency injection.

This practice comes with several downsides, including performance and failure to resolve dependency tree.

The `ContextService` offers an stable alternative, based on NodeJS async local storage, to access request data anywhere.


### Usage

Simply inject the `ContextService` at your target provider:

```ts
import { ContextService } from '@bechara/crux';

@Injectable()
export class FooService {

  public constructor(
    private readonly contextService: ContextService,
  ) { }

  public async getRequestAuthorization() {
    const req = this.contextService.getRequest();
    return req.headers.authorization;
  }

  public async getUserId() {
    return this.contextService.getMetadata('userId');
  }

  public async setUserId(userId: string) {
    this.contextService.setMetadata('userId', userId);
  }

}
```

---

## Documentation Module

Generate OpenAPI documentation based on [NestJS - OpenAPI Decorators](https://docs.nestjs.com/openapi/decorators).

User interface is available at `/docs` endpoint, and OpenAPI specification at `/docs/json`.

---

## Http Module

Work as a wrapper of Node.js Fetch API and exposes methods to make http requests.

The scope of this module is transient, which means one new instance will be provided every time it is injected.


### Usage

Register it in every module to which a provider will receive an injection of the http service.

First at `foo.module.ts`:

```ts
import { HttpModule } from '@bechara/crux';

@Module({
  imports: [ HttpModule.register() ],
  controller: [ FooController ],
  providers: [ FooService ],
})
export class FooModule { }
```

Then at `foo.service.ts`:

```ts
import { HttpService } from '@bechara/crux';

@Injectable()
export class FooService {

  public constructor(
    private readonly httpService: HttpService,
  ) { }

  public async readFooById(id: number) {
    return this.httpService.get('https://foo.com/foo/:id', {
      replacements: { id },
    });
  }
}
```

In a real world scenario, you would like to be able to configure base params like host, headers, api keys, certificates, etc.

To be able to do this while acquiring secrets asynchronously, you may register the module as following:

```ts
import { HttpAsyncModuleOptions, HttpModule } from '@bechara/crux';

const httpModuleOptions: HttpAsyncModuleOptions = {
  inject: [ FooConfig ],
  useFactory: (fooConfig: FooConfig) => ({
    prefixUrl: fooConfig.FOO_API_URL,
    headers: { authorization: fooConfig.FOO_API_KEY },
    timeout: 20 * 1000,
  })
};

@Module({
  imports: [ 
    HttpModule.registerAsync(httpModuleOptions),
  ],
  controller: [ FooController ],
  providers: [ FooConfig, FooService ],
  exports: [ FooConfig, FooService ],
})
export class FooModule { }
```

---


## Cache Module

Allows caching inbound responses for paths decorated with `@Cache()`.

Uses underlying Redis Module, falling back to Memory Module when unavailable.


### Usage

Add the `@Cache()` to target controller method:

```ts
import { Cache, Controller, Get } from '@bechara/crux';

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

## Memory Module

Allow setting and reading keys from memory with configurable TTL.


### Usage

Import `MemoryModule` at your application, followed by injecting `MemoryService` at your target provider:

```ts
import { InternalServerErrorException, MemoryService } from '@bechara/crux';

@Injectable()
export class FooService {

  public constructor(
    private readonly memoryService: MemoryService,
  ) { }

  public getFoo(): unknown {
    const foo = this.memoryService.get('FOO');

    if (!foo) {
      throw new InternalServerErrorException('foo not available');
    }
  }

  public setFoo(params: unknown): void {
    const ttl = 5 * 60 * 1000; // 5 minutes
    this.memoryService.set('FOO', params, { ttl });
  }

}
```

---

## Promise Module

Offers a set of utility functions to handle Promises, including retry, deduplication and throttling.

Refer to [PromiseService](source/promise/promise.service.ts) for further details.


### Usage

Import `PromiseModule` at your application, followed by injecting `PromiseService` at your target provider:

```ts
import { PromiseService, HttpService } from '@bechara/crux';

@Injectable()
export class FooService {

  public constructor(
    private readonly promiseService: PromiseService,
    private readonly httpService: HttpService,
  ) { }

  public async readFooOrTimeout(): Promise<unknown> {
    const timeout = 5000; // 5 seconds
    return this.promiseService.resolveOrTimeout({
      promise: () => this.httpService.get('foo'),
      timeout
    });
  }

  public async readFooWithRetry(): Promise<unknown> {
    return this.promiseService.retryOnRejection({
      method: () => this.httpService.get('foo'),
      retries: 5,
      timeout: 2 * 60 * 1000, // 2 minutes,
      delay: 500, // 500 ms
    });
  }

}
```

---

## Metric Module

Collect metrics based on [Prometheus](https://prometheus.io/).

Scraping is available at `/metrics` endpoint.


### Usage

To create you own metrics, use provided methods `getCounter()`, `getGauge()`, `getHistogram()` or `getSummary()`, from the `MetricService`.

```ts
import { Histogram, MetricService } from '@bechara/crux';

@Injectable()
export class FooService {

  public constructor(
    private readonly metricService: MetricService,
  ) {
    setup();
  }

  public setup(): void {
    this.metricService.getHistogram('foo_size', {
      help: 'Size of foo.',
      labelNames: [ 'foo', 'bar' ],
      buckets: [ 1, 3, 5, 8, 13 ],
    });
  }

  public readFoo(): Foo {
    // ...
    const histogram = this.metricService.getHistogram('foo_size');
    // ...
  }
}
```

---


## Log Module

Offers a log service with predefined severity levels. When called, broadcasts the message to all connected transports and based on their own configuration decide whether or not to publish at it.


### Usage

Inject `LogService` at your provide and call any of its method based on severity:

```ts
import { LogService } from '@bechara/crux';

@Injectable()
export class FooService {

  public constructor(
    private readonly fooRepository: Repository<FooEntity>,
    private readonly logService: LogService,
  ) { }

  public async readFooById(id: number) {
    let foo: FooEntity;
    this.logService.debug(`Reading foo with id ${id}`);

    try {
      foo = await this.FooRepository.readById(id);
    }
    catch (e) {
      this.logService.error(`Failed to read foo`, e, id);
      throw new InternalServerErrorException();
    }

    this.logService.notice(`Successfully read foo with id ${id}`);
    return foo;
  }
}
```


### Call Signatures

The logging method accepts multiples arguments of the following typing:

```ts
type LogArguments = string | Error | Record<string, any>;
```

Which means you may call them in any combination of:

```ts
this.logService.error(a: string);
this.logService.error(a: string, b: Error);
this.logService.error(a: string, b: Record<string, any>);
this.logService.error(a: Error, b: Record<string, any>);
this.logService.error(a: string, b: Record<string, any>, c: Record<string, any>);
this.logService.error(a: string, b: Error, c: Record<string, any>);
this.logService.error(a: Error, b: Record<string, any>, c: Record<string, any>);
this.logService.error(a: string, b: Error, c: Record<string, any>, d: Record<string, any>);
// etc...
```


### Transporters

This package offers the following built-in transporters: Console and Loki.

Configuration will be acquired from environment according to the following variables.

#### Console

Print messages at stdout, enabled by default.

Variable         | Required | Type   | Default
:--------------- | :------: | :----: | :---
CONSOLE_SEVERITY | No       | string | `trace` when `NODE_ENV=local`, `warning` otherwise

#### Loki

Publish logs to [Loki](https://grafana.com/oss/loki) by pushing through its API.

To enable this integration provide `LOKI_URL`, you may also provide basic auth credentials.

Variable      | Required | Type   | Default
:------------ | :------: | :----: | :---
LOKI_URL      | Yes      | string |
LOKI_USERNAME | No       | string |
LOKI_PASSWORD | No       | string |
LOKI_SEVERITY | No       | string | `debug`

---

## Trace Module

Collect traces based on [Open Telemetry](https://opentelemetry.io/docs/), and propagates them using B3 standards headers.

By default it will automatically parse context from inbound HTTP headers to create current request span.

Child spans are generated for all outbound HTTP requests, an you may create new spans by using `startSpan()` from  `TraceService`:


### Usage

```ts
import { TraceService } from '@bechara/crux';

@Injectable()
export class FooService {

  public constructor(
    private readonly traceService: TraceService,
  ) { }

  public readFoo(): Foo {
    const span = this.traceService.startSpan('Reading Foo');
    // ...
    span.close();
  }
}
```

---

## ORM Module

Adds ORM capabilities including schema sync and repository pattern.


### Usage

Add these example variables to your `.env` (adjust accordingly):

```bash
# Standard connection
ORM_TYPE='mysql'
ORM_HOST='localhost'
ORM_PORT=3306
ORM_USERNAME='root'
ORM_PASSWORD=''
ORM_DATABASE='test'

# SSL options
ORM_SERVER_CA=''
ORM_CLIENT_CERTIFICATE=''
ORM_CLIENT_KEY=''
```

It is recommended that you have a local database in order to test connectivity.

Import `OrmModule` and `OrmConfig` into you boot script and configure asynchronously:

```ts
import { AppEnvironment, AppModule, OrmConfig. OrmModule, PostgresSqlDriver } from '@bechara/crux';

void AppModule.bootServer({
  configs: [ OrmConfig ],
  imports: [
    OrmModule.registerAsync({
      inject: [ OrmConfig ],
      useFactory: (ormConfig: OrmConfig) => ({
        driver: PostgresSqlDriver,
        host: ormConfig.ORM_HOST,
        port: ormConfig.ORM_PORT,
        dbName: ormConfig.ORM_DATABASE,
        user: ormConfig.ORM_USERNAME,
        password: ormConfig.ORM_PASSWORD,
        pool: { min: 1, max: 25 },
        sync: {
          auto: true,
          controller: true,
          safe: ormConfig.NODE_ENV === AppEnvironment.PRODUCTION,
        },
        // SSL configuration (optional)
        driverOptions: {
          connection: {
            ssl: {
              ca: Buffer.from(ormConfig.ORM_SERVER_CA, 'base64'),
              cert: Buffer.from(ormConfig.ORM_CLIENT_CERTIFICATE, 'base64'),
              key: Buffer.from(ormConfig.ORM_CLIENT_KEY, 'base64'),
            },
          },
        },
      }),
    }),
  ],
  providers: [ OrmConfig ],
  exports: [ OrmConfig, OrmModule ],
});
```

If you wish to change how environment variables are injected you may provide your own configuration instead of using the built-in `OrmConfig`.

We may simplify the process of adding data storage functionality as:
- Create the entity definition (table, columns and relationships)
- Create its service (repository abstraction extending provided one)
- Create its controller (extending provided one)

### Creating an Entity Definition

Please refer to the official [Defining Entities](https://mikro-orm.io/docs/defining-entities) documentation from MikroORM.

### Creating an Entity Repository

In order to create a new entity repository, extend the provided abstract repository from this package.

Then, you should call its super method passing this instance as well as an optional object with further customizations.

Example:

```ts
import { EntityManager, EntityName, OrmRepository, Repository } from '@bechara/nestjs-orm';

import { User } from './user.entity';

@Repository(User)
export class UserRepository extends OrmRepository<User> {

  public constructor(
    protected readonly entityManager: EntityManager,
    protected readonly entityName: EntityName<User>,
  ) {
    super(entityManager, entityName, {
      defaultUniqueKey: [ 'name', 'surname' ],
    });
  }

}
```

At this point, an injectable `UserRepository` will be available throughout the application, exposing extra ORM functionalities.

```ts
// Read operations
populate(): Promise<void>;
readBy(): Promise<Entity[]>;
readById(): Promise<Entity>;
readByIdOrFail(): Promise<Entity>;
readUnique(): Promise<Entity>;
readUniqueOrFail(): Promise<Entity>;
countBy(): Promise<number>;
readPaginatedBy(): Promise<OrmPaginatedResponse<Entity>>;

// Create operations
build(): Entity[];
buildOne(): Entity;
create(): Promise<Entity[]>;
createOne(): Promise<Entity>;

// Update operations
update(): Promise<Entity[]>;
updateBy(): Promise<Entity[]>;
updateById(): Promise<Entity>;
updateOne(): Promise<Entity>;
upsert(): Promise<Entity[]>;
upsertOne(): Promise<Entity>;

// Async manipulation (optional)
commit(): Promise<void>;
```


### Creating an Entity Controller

Finally, expose a controller injecting your repository as dependency to allow manipulation through HTTP requests.

If you are looking for CRUD functionality you may copy exactly as the template below.

Example:

```ts
import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@bechara/crux';
import { OrmController, OrmPageDto } from '@bechara/nestjs-orm';

// These DTOs are validations customized with class-validator and class-transformer
import { UserCreateDto, UserReadDto, UserUpdateDto } from './user.dto';
import { User } from './user.entity';
import { UserService } from './user.service';

@Controller('user')
export class UserController {

  public constructor(
    private readonly userRepository: UserRepository,
  ) { }

  @Get()
  public async get(@Query() query: UserReadDto): Promise<OrmPageDto<User>> {
    return this.userRepository.readPaginatedBy(query);
  }

  @Get(':id')
  public async getById(@Param('id') id: string): Promise<User> {
    return this.userRepository.readByIdOrFail(id);
  }

  @Post()
  public async post(@Body() body: UserCreateDto): Promise<User> {
    return this.userRepository.createOne(body);
  }

  @Put()
  public async put(@Body() body: UserCreateDto): Promise<User> {
    return this.userRepository.upsertOne(body);
  }

  @Put(':id')
  public async putById(@Param('id') id: string, @Body() body: UserCreateDto): Promise<User> {
    return this.userRepository.updateById(id, body);
  }

  @Patch(':id')
  public async patchById(@Param('id') id: string, @Body() body: UserUpdateDto): Promise<User> {
    return this.userRepository.updateById(id, body);
  }

  @Delete(':id')
  public async deleteById(@Param('id') id: string): Promise<User> {
    return this.userRepository.deleteById(id);
  }

}
```
