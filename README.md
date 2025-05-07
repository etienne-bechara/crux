# CRUX

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=crux&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=crux)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=crux&metric=coverage)](https://sonarcloud.io/summary/new_code?id=crux)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=crux&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=crux)
[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=crux&metric=reliability_rating)](https://sonarcloud.io/summary/new_code?id=crux)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=crux&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=crux)

CRUX is an opinionated Node.js framework package designed for backend projects. It integrates a range of libraries and patterns commonly used in distributed, stateless applications that require database access.

- **Framework:** [NestJS](https://docs.nestjs.com/)
- **HTTP Server:** [Fastify](https://www.fastify.io/docs/latest/)
- **HTTP Client:** [Fetch](https://nodejs.org/dist/latest-v18.x/docs/api/globals.html#fetch)
- **Caching:** [ioredis](https://www.npmjs.com/package/ioredis) (distributed) or in-memory (local)
- **ORM:** [MikroORM](https://mikro-orm.io/docs/installation)
- **OpenAPI:** [Scalar](https://scalar.com/)
- **Logs:** [Loki](https://grafana.com/docs/loki/latest/api/)
- **Metrics:** [Prometheus](https://github.com/siimon/prom-client)
- **Tracing:** [Tempo](https://grafana.com/docs/tempo/latest/api_docs/) with [OpenTelemetry](https://github.com/open-telemetry/opentelemetry-js)

---

## Disclaimer

This framework was created to avoid rebuilding similar boilerplates for distributed, stateless backend projects with database access. It is highly opinionated and should be treated more as a reference for creating your own solutions rather than as a production-ready product.

---

## Installation

1. **Create and initialize a new Node.js project**, then install TypeScript, its types, a live-reload tool, and this package.  

   We recommend using [pnpm](https://pnpm.io/) as your package manager, and [ts-node-dev](https://github.com/wclr/ts-node-dev) for live reloading:

   ```sh
   mkdir my-project
   cd my-project

   git init
   npm init -y

   npm i -g pnpm
   pnpm i -D typescript @types/node ts-node-dev
   pnpm i -E @bechara/crux

   tsc --init
   ```

2. **Create a `main.ts` file** in a `/source` folder with the following content:

   ```ts
   // /source/main.ts
   import { AppModule } from '@bechara/crux';

   void AppModule.boot();
   ```

3. **Add a `dev` script** in your `package.json`:

   ```json
   {
     "scripts": {
       "dev": "tsnd --exit-child --rs --watch *.env --inspect=0.0.0.0:9229 ./source/main.ts"
     }
   }
   ```

4. **Start the application**:

   ```sh
   pnpm dev
   ```

   You can test it by sending a request to `GET /`. You should receive a successful response with a `204` status code.

---

## Development

Using this framework mostly follows the official [NestJS Documentation](https://docs.nestjs.com/). Familiarize yourself with the following core NestJS concepts before continuing:

- [Modules](https://docs.nestjs.com/modules)
- [Controllers](https://docs.nestjs.com/controllers)
- [Providers](https://docs.nestjs.com/providers)

### Key Differences

1. **Imports from `@bechara/crux`**  
   All NestJS imports, such as `@nestjs/common` or `@nestjs/core`, are re-exported by `@bechara/crux`.  
   Instead of:
   ```ts
   import { Injectable } from '@nestjs/common';
   ```
   use:
   ```ts
   import { Injectable } from '@bechara/crux';
   ```

2. **Automatic Module Loading**  
   Any file ending with `*.module.ts` in your source folder is automatically loaded by `main.ts`. You don’t need to create a global module importing them manually.  
   Instead of:
   ```ts
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
   simply do:
   ```ts
   import { AppModule } from '@bechara/crux';

   void AppModule.boot();
   // FooModule, BarModule, and BazModule are automatically loaded
   // as long as they're in the source folder and named *.module.ts
   ```

---

## Testing

Testing can involve multiple environment variables, making it more complex to write boilerplate code. For this reason, `AppModule` offers a built-in `compile()` method to create an application instance without serving it.

### Usage

In your `*.service.spec.ts`, add a `beforeAll()` hook to compile an application instance:

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
      const foo = await fooService.readById(1);
      expect(foo).toEqual({ name: 'bob' });
    });
  });
});
```

If you need custom options, the `compile()` method supports the same boot options as `boot()`.

Run all tests with:

```sh
pnpm test
```

Or a specific set:

```sh
pnpm test -- foo
```

---

# Curated Modules

Below are details about the main modules in this framework and how to use them.

## Application Module

Acts as the entry point, wrapping other modules in this package and automatically loading any `*.module.ts` in your source folder.  

By default, it serves an HTTP adapter using [Fastify](https://www.fastify.io/). The following custom enhancers are globally applied:

- [app.interceptor.ts](source/app/app.interceptor.ts): A timeout interceptor that cancels requests exceeding the configured runtime.
- [app.filter.ts](source/app/app.filter.ts): An exception filter integrated with the logging service for standardized error output.
- [ClassSerializer](https://docs.nestjs.com/techniques/serialization#serialization) for response serialization.
- [ValidationPipe](https://docs.nestjs.com/techniques/validation#validation) for DTO validation and transformation.

### Environment Configuration

| Variable  | Mandatory | Type                                                   |
|-----------|:--------:|--------------------------------------------------------|
| NODE_ENV  | Yes       | [AppEnvironment](source/app/app.enum/app.environment.ts) |

### Module Options

When booting your application, you can configure options as described in [AppBootOptions](source/app/app.interface.ts):

```ts
import { AppModule } from '@bechara/crux';

void AppModule.boot({
  // See AppBootOptions for detailed properties
});
```

Provided options will be merged with the [default configuration](source/app/app.config.ts).

---

## Configuration Module

Allows asynchronous population of secrets through `*.config.ts` files containing configuration classes.  

Decorate a class with `@Config()` to make it available as a regular NestJS provider. Any property decorated with `@InjectSecret()` will have its value extracted from `process.env` and injected into the class.

### Usage

1. **Create a `*.config.ts` file** with a class decorated by `@Config()`.  
2. Decorate any properties with `@InjectSecret()`.  
3. Optionally, apply `class-validator` and `class-transformer` decorators for validation and transformation.

Example:

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
  FOO_API_MAX_CONCURRENCY: number;
}
```

Use the configuration in your module and services:

```ts
@Injectable()
export class FooService {
  constructor(private readonly fooConfig: FooConfig) {}

  public async readFooById(id: number) {
    console.log(this.fooConfig.FOO_API_MAX_CONCURRENCY);
    // ...
  }
}
```

---

## Context Module

Provides `ContextService`, an alternative to `REQUEST`-scoped injections in NestJS. It leverages Node.js AsyncLocalStorage to store request data without the performance or dependency-resolution challenges of `REQUEST` scope.

### Usage

```ts
import { ContextService } from '@bechara/crux';

@Injectable()
export class FooService {
  constructor(private readonly contextService: ContextService) {}

  public getRequestAuthorization() {
    const req = this.contextService.getRequest();
    return req.headers.authorization;
  }

  public getUserId() {
    return this.contextService.getMetadata('userId');
  }

  public setUserId(userId: string) {
    this.contextService.setMetadata('userId', userId);
  }
}
```

---

## Documentation Module

Generates OpenAPI documentation using [NestJS OpenAPI Decorators](https://docs.nestjs.com/openapi/decorators).  

- **User interface:** available at `/docs`
- **OpenAPI spec:** available at `/docs/json`

---

## Http Module

Provides a wrapper over Node.js Fetch API, exposing methods to make HTTP requests. Its scope is transient: every injection yields a fresh instance.

### Basic Usage

In your module:

```ts
import { HttpModule } from '@bechara/crux';

@Module({
  imports: [HttpModule.register()],
  controllers: [FooController],
  providers: [FooService],
})
export class FooModule {}
```

In your service:

```ts
import { HttpService } from '@bechara/crux';

@Injectable()
export class FooService {
  constructor(private readonly httpService: HttpService) {}

  public async readFooById(id: number) {
    return this.httpService.get('https://foo.com/foo/:id', {
      replacements: { id },
    });
  }
}
```

### Async Registration

To configure base parameters (host, headers, API keys, etc.) using environment secrets:

```ts
import { HttpAsyncModuleOptions, HttpModule } from '@bechara/crux';

const httpModuleOptions: HttpAsyncModuleOptions = {
  inject: [FooConfig],
  useFactory: (fooConfig: FooConfig) => ({
    prefixUrl: fooConfig.FOO_API_URL,
    headers: { authorization: fooConfig.FOO_API_KEY },
    timeout: 20_000,
  }),
};

@Module({
  imports: [HttpModule.registerAsync(httpModuleOptions)],
  controllers: [FooController],
  providers: [FooConfig, FooService],
  exports: [FooConfig, FooService],
})
export class FooModule {}
```

---

## Cache Module

Allows caching of inbound responses for controller paths decorated with `@Cache()`. Uses Redis (through `ioredis`) if available, falling back to an in-memory store.

### Usage

```ts
import { Cache, Controller, Get, Param } from '@bechara/crux';

@Controller('foo')
export class FooController {
  constructor(private readonly fooService: FooService) {}

  @Cache({ ttl: 60_000 }) // 60 seconds
  @Get(':id')
  public getFoo(@Param('id') id: string): Promise<Foo> {
    return this.fooService.getFooById(id);
  }
}
```

### Environment Variables

| Variable       | Required | Type   | Default |
|----------------|:--------:|:------:|:-------:|
| CACHE_HOST     | No       | string |         |
| CACHE_PORT     | No       | number |         |
| CACHE_USERNAME | No       | string |         |
| CACHE_PASSWORD | No       | string |         |

---

## Redis Module

Provides a connection to Redis via [ioredis](https://github.com/redis/ioredis). It automatically uses credentials configured through the Cache Module.

### Usage

```ts
import { RedisService } from '@bechara/crux';

@Injectable()
export class FooService {
  constructor(private readonly redisService: RedisService) {}

  public getFoo() {
    const foo = this.redisService.get('FOO');
    if (!foo) {
      throw new InternalServerErrorException('Foo not available');
    }
    return foo;
  }

  public setFoo(params: unknown) {
    const ttl = 5 * 60_000; // 5 minutes
    this.redisService.set('FOO', params, { ttl });
  }
}
```

---

## Memory Module

Offers a simple in-memory key-value store with support for TTL.

### Usage

```ts
import { MemoryService } from '@bechara/crux';

@Injectable()
export class FooService {
  constructor(private readonly memoryService: MemoryService) {}

  public getFoo() {
    const foo = this.memoryService.get('FOO');
    if (!foo) {
      throw new InternalServerErrorException('Foo not available');
    }
    return foo;
  }

  public setFoo(params: unknown) {
    const ttl = 5 * 60_000; // 5 minutes
    this.memoryService.set('FOO', params, { ttl });
  }
}
```

---

## Promise Module

Provides utility functions for working with Promises (retrying, deduplication, throttling, etc.). Refer to [PromiseService](source/promise/promise.service.ts) for details.

### Usage

```ts
import { PromiseService, HttpService } from '@bechara/crux';

@Injectable()
export class FooService {
  constructor(
    private readonly promiseService: PromiseService,
    private readonly httpService: HttpService,
  ) {}

  public async readFooOrTimeout(): Promise<unknown> {
    const timeout = 5000; // 5 seconds
    return this.promiseService.resolveOrTimeout({
      promise: () => this.httpService.get('foo'),
      timeout,
    });
  }

  public async readFooWithRetry(): Promise<unknown> {
    return this.promiseService.retryOnRejection({
      method: () => this.httpService.get('foo'),
      retries: 5,
      timeout: 120_000, // 2 minutes
      delay: 500,       // 500 ms
    });
  }
}
```

---

## Metric Module

Collects metrics using [Prometheus](https://prometheus.io/). Metrics can be scraped at the `/metrics` endpoint.

### Usage

Inject `MetricService` to create custom counters, gauges, histograms, or summaries:

```ts
import { Histogram, MetricService } from '@bechara/crux';

@Injectable()
export class FooService {
  constructor(private readonly metricService: MetricService) {
    this.setupMetrics();
  }

  private setupMetrics(): void {
    this.metricService.getHistogram('foo_size', {
      help: 'Size of foo.',
      labelNames: ['foo', 'bar'],
      buckets: [1, 3, 5, 8, 13],
    });
  }

  public readFoo() {
    const histogram = this.metricService.getHistogram('foo_size');
    // ...
  }
}
```

---

## Log Module

Provides a logging service with predefined severity levels. Messages are broadcast to all configured transports, which decide whether to publish them based on their own configuration.

### Usage

```ts
import { LogService } from '@bechara/crux';

@Injectable()
export class FooService {
  constructor(
    private readonly fooRepository: FooRepository,
    private readonly logService: LogService,
  ) {}

  public async readFooById(id: number) {
    this.logService.debug(`Reading foo with ID ${id}`);

    try {
      const foo = await this.fooRepository.readById(id);
      this.logService.notice(`Successfully read foo with ID ${id}`);
      return foo;
    } catch (error) {
      this.logService.error(`Failed to read foo`, error, { id });
      throw new InternalServerErrorException();
    }
  }
}
```

### Call Signatures

Logging methods accept any combination of strings, `Error` objects, or plain objects:

```ts
this.logService.error('Something went wrong');
this.logService.error('Something went wrong', new Error('Log example'));
this.logService.error(new Error('Log example'), { key: 'value' });
this.logService.error('Error message', new Error('Log example'), { key: 'value' });
// ...and so on
```

### Transporters

Two transports are built in: **Console** and **Loki**.

#### Console Transport

Enabled by default. Controlled by:

| Variable         | Required | Type   | Default                            |
|------------------|:--------:|:------:|------------------------------------|
| CONSOLE_SEVERITY | No       | string | `trace` if `NODE_ENV=local`; `warning` otherwise |

#### Loki Transport

Publishes logs to [Loki](https://grafana.com/oss/loki/) via its API. To enable, set `LOKI_URL`:

| Variable      | Required | Type   | Default  |
|---------------|:--------:|:------:|:--------:|
| LOKI_URL      | Yes      | string |          |
| LOKI_USERNAME | No       | string |          |
| LOKI_PASSWORD | No       | string |          |
| LOKI_SEVERITY | No       | string | `debug`  |

---

## Trace Module

Implements distributed tracing using [OpenTelemetry](https://opentelemetry.io/docs/) with B3 header propagation. It automatically creates spans for inbound HTTP requests and outbound HTTP calls. You can also create custom spans using `startSpan()` from `TraceService`.

### Usage

```ts
import { TraceService } from '@bechara/crux';

@Injectable()
export class FooService {
  constructor(private readonly traceService: TraceService) {}

  public readFoo(): Foo {
    const span = this.traceService.startSpan('Reading Foo');
    // ...
    span.close();
  }
}
```

---

## ORM Module

Adds ORM support using [MikroORM](https://mikro-orm.io/), providing schema synchronization and a repository pattern.

### Environment Variables

Add relevant connection variables (e.g., for MySQL or PostgreSQL) to your `.env`:

```bash
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

### Registration

```ts
import {
  AppEnvironment,
  AppModule,
  OrmConfig,
  OrmModule,
  PostgresSqlDriver,
} from '@bechara/crux';

void AppModule.boot({
  configs: [OrmConfig],
  imports: [
    OrmModule.registerAsync({
      inject: [OrmConfig],
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
  providers: [OrmConfig],
  exports: [OrmConfig, OrmModule],
});
```

If you prefer, you can replace `OrmConfig` with your own configuration class and secrets.

### Creating an Entity

Refer to the [MikroORM docs on defining entities](https://mikro-orm.io/docs/defining-entities) for detailed guidance.

### Creating a Repository

Extend the built-in abstract repository for additional ORM capabilities:

```ts
import {
  EntityManager,
  EntityName,
  OrmRepository,
  Repository,
} from '@bechara/crux';
import { User } from './user.entity';

@Repository(User)
export class UserRepository extends OrmRepository<User> {
  constructor(
    protected readonly entityManager: EntityManager,
    protected readonly entityName: EntityName<User>,
  ) {
    super(entityManager, entityName, {
      defaultUniqueKey: ['name', 'surname'],
    });
  }
}
```

### Creating a Controller

Create a controller that injects your repository to handle HTTP requests. For example, a CRUD controller:

```ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  OrmPageDto,
} from '@bechara/crux';
import { UserRepository } from './user.repository';
import { UserCreateDto, UserReadDto, UserUpdateDto } from './user.dto';
import { User } from './user.entity';

@Controller('user')
export class UserController {
  constructor(private readonly userRepository: UserRepository) {}

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
  public async putById(
    @Param('id') id: string,
    @Body() body: UserCreateDto,
  ): Promise<User> {
    return this.userRepository.updateById(id, body);
  }

  @Patch(':id')
  public async patchById(
    @Param('id') id: string,
    @Body() body: UserUpdateDto,
  ): Promise<User> {
    return this.userRepository.updateById(id, body);
  }

  @Delete(':id')
  public async deleteById(@Param('id') id: string): Promise<User> {
    return this.userRepository.deleteById(id);
  }
}
```
