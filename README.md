# NestJS Core Components

This package offers a wrapper around NestJS core components adding extra characteristics commonly found across back-end projects.

## Disclaimer

NestJS offers their own suggestions on how to implement  [Configuration](https://docs.nestjs.com/techniques/configuration#configuration), [Http Requests](https://docs.nestjs.com/techniques/http-module#http-module) and [Logger](https://docs.nestjs.com/techniques/logger#logger).

The implementations on this package differs in some ways to allow more flexibility as well as integration as a core feature.

## Features

All characteristics from NestJS [documentation](https://docs.nestjs.com/) plus:

- [[AppModule](#App-Module)] Bootstrap around Express server with CORS and JSON size limit configurations.
- [[AppModule](#App-Module)] Global exception filter integrated to logger service.
- [[AppModule](#App-Module)] Global entry point middleware for request IP, User Agent and JWT payload extraction.
- [[AppModule](#App-Module)] Global timeout interceptor to cancel any running request.
- [[AppModule](#App-Module)] Global validation pipe and serializer to verify decorated DTOs and automatically throw bad requests.
- [[ConfigModule](#Config-Module)] Support for custom configuration classes.
- [[ConfigModule](#Config-Module)] Secret variables validation.
- [[HttpModule](#Http-Module)] Creation of base instance with reusable url, headers or body.
- [[HttpModule](#Http-Module)] Customize exception handler and client side timeout implementation.
- [[HttpModule](#Http-Module)] Response cookies parser.
- [[LoggerModule](#Logger-Module)] Custom logger with 7 severity levels.
- [[LoggerModule](#Logger-Module)] Support for custom transports.
- [[LoggerModule](#Logger-Module)] Custom colored console printer (local environment only)].
- [[LoggerModule](#Logger-Module)] Integration with Sentry monitoring provider.
- [[LoggerModule](#Logger-Module)] Integration with Slack webhooks for channel posting.
- [[LoggerModule](#Logger-Module)] Publish enriching data with severity and inbound request data.
- [[UtilModule](#Util-Module)] Glob pattern matcher to require modules.
- [[UtilModule](#Util-Module)] IP address resolver for client and server.
- [[UtilModule](#Util-Module)] Async method retrier customizable by quantity or time.
- [[TestModule](#Test-Module)] Jest wrapper to create a full sandbox when testing individual modules.

---

## Usage

### **TL;DR**

To boot a full application with all mentioned features, run in a clean folder:

_First command is for Windows users only_

```
$PSDefaultParameterValues['Out-File:Encoding'] = 'utf8'

npm init -y

npm i -D typescript @types/node ts-node-dev
npm i @bechara/nestjs-core

echo "NODE_ENV=local" > .env
echo "import { AppModule } from '@bechara/nestjs-core';" > main.ts
echo "AppModule.bootServer();" >> main.ts

npx tsc --init
npx tsnd main.ts
```

To validate its functionality, navigate to:

http://localhost:8080/util/status

Your console should output:

```
2020-11-03 20:00:53  INF  Environment configured as local
2020-11-03 20:00:53  DBG  Server timeouts are set to 90s
2020-11-03 20:00:53  NTC  Server listening on port 8080
2020-11-03 20:01:12  HTP  > GET    /util/status | ::1 | PostmanRuntime/7.26.8
2020-11-03 20:01:12  HTP  < GET    /util/status | 200 | 18 ms
```

### Step by Step Setup

The following instructions assumes starting a new repository from scratch.

You may skip steps as you see fit.

Initialize a Node.js repository:

```
npm init -y
git init
```

Install TypeScript dependencies, and generate a standard `tsconfig.json` file:

```
npm i -D typescript @types/node
npx tsc --init
```

To be able to run your project without the need to transpile every time, install this utility:

```
npm i -D ts-node-dev
```

Install this package which will also add compatible NestJS framework:

```
npm i @bechara/nestjs-core
```

When using this package, it is mandatory to specify the current environment Node.js is running, to do so, create a `.env` file with the following content:

```
NODE_ENV='local'
```

Now, add a `main.ts` file with this snippet:

```ts
import { AppModule } from '@bechara/nestjs-core';

AppModule.bootServer();
```

Finally, run the application with `ts-node-dev` utility:

```
npx tsnd main.ts
```

Alternatively, you can transpile the files and execute with regular Node.js command:

```
npx tsc
node main.js
```

To understand better the responsibility of each component, refer to the following sections.


## Components

Before diving into this section, make sure you understand these base concepts of NestJS framework:

- [NestJS Intro](https://docs.nestjs.com/)
- [NestJS Modules](https://docs.nestjs.com/modules)
- [NestJS Providers](https://docs.nestjs.com/providers)

### App Module

The application module acts as an entry point, wrapping the other modules provided in this package as well as automatically requiring any `*.module.ts` file in the project `/source` folder.

It also adds these functionalities globally:
- Exception filter integrated to logger service and censoring of production exceptions, see [app.filter.ts](source/app/app.filter.ts).
- Middleware for request IP, User Agent and JWT payload extraction, see [app.middleware.ts](source/app/app.middleware.ts).
- Timeout interceptor to cancel running request that expires configured runtime, see [app.timeout.interceptor.ts](source/app/app.interceptor/app.timeout.interceptor.ts).
- Validation pipe and serializer to verify decorated DTOs and automatically throw bad requests, see [app.module.ts](source/app/app.module.ts).

The only mandatory environment variable is `NODE_ENV`, and it may be configure through a `.env` file at the root of your project with:

```
NODE_ENV='local'
```

Accepted values includes `production`, `staging`, `development`, `local` and `test`.

Further application customization is available through the following environment variables.

**Configuration**

Variable | Type | Default
:--- | :---: | :---
NODE_ENV | [AppEnvironment](source/app/app.enum/app.environment.ts) | `undefined`
APP_PORT | number | 8080
APP_GLOBAL_PREFIX | string | `empty`
APP_JSON_LIMIT | string | 10mb
APP_TIMEOUT | number | 90000 (90s)
APP_CORS_ORIGIN | string | *
APP_CORS_METHODS | string | GET,HEAD,PUT,PATCH,POST,DELETE

To fully bootstrap your application with predefined rules, call the method `bootServer()` from your `main.ts` file:

```ts
import { AppModule } from '@bechara/nestjs-core';

AppModule.bootServer();
```

If you wish, you may disable the automatic module and configuration imports from your `/source` folder, and add them manually:

```ts
AppModule.bootServer({
  disableSourceImports: true,
  modules: [ CatModule ],
  configs: [ CatConfig ],
});
```

Also, you may disable the native integrations and add everything manually:

```ts
AppModule.bootServer({
  disableDefaultImports: true,
  disableSourceImports: true,
  modules: [
    LoggerModule,
    SentryModule,
    CatModule,
  ],
  configs: [
    LoggerConfig,
    SentryConfig,
    CatConfig
  ],
});
```


### Config Module

Server the purpose of allowing asynchronous secret population and dependency injection, it works along with `*.config.ts` files that contains the definition of injectable class.

Basically, everything decorated with `@InjectSecret()` will have its value extracted from `process.env` and added to the class.

**Example**

```ts
import { InjectSecret } from '@bechara/nestjs-core';

@Injectable()
export class CatConfig {

  @InjectSecret()
  CAT_API_URL: string;

  // You can use 'key' if the env variable has
  // a different name than the property.
  @InjectSecret({ key: 'cat_authorization' })
  CAT_API_KEY: string;

  // You can use 'default' if you wish to set
  // a fallback value
  @InjectSecret({ default: 15 })
  CAT_API_MAX_CONCURRENCY: number;

}
```

The framework also allows decoration of properties using `class-validator` and `class-transformer` to enforce the presence and validity of the value before initialization:

**Example**

```ts
import { InjectSecret } from '@bechara/nestjs-core';
import { IsUrl, IsString, Length } from 'class-validator';
import { Transform } from 'class-transformer';

@Injectable()
export class CatConfig {

  @InjectSecret()
  @IsUrl()
  CAT_API_URL: string;

  @InjectSecret({ key: 'cat_authorization' })
  @IsString() @Length(36)
  CAT_API_KEY: string;

  @InjectSecret({ default: '15' })
  @Transform((v) => Number.parseInt(v))
  @IsNumber()
  CAT_API_MAX_CONCURRENCY: number;

}
```

Finally, to use the secrets, you must add the configuration class to the array of providers of your module and inject it into your service:

**Example**

```ts
@Injectable()
export class CatService {
  private catsBeingFetched: number;

  public constructor(
    private readonly catConfig: CatConfig,
  ) { }

  public async getCat(id: number) {
    const maxConc = this.catConfig.CAT_API_MAX_CONCURRENCY;
    
    if (this.catsBeingFetched >= maxConc) {
      throw new Error('too many cats being fetched');
    }

    // ...
  }
}
```


### Http Module

Works as a wrapper of Axios library and exposes methods to make http requests.

The scope of this module is transient, which means one new instance will be provided every time it is injected.

For this to work correctly, you must register it in every module to which a provider will receive an injection of the https service.

**Example**

```ts
// First at cat.module.ts
import { HttpModule } from '@bechara/nestjs-core';

@Module({
  imports: [ HttpModule.register() ],
  controller: [ CatController ],
  providers: [ CatService ],
})
export class CatModule { }
```

```ts
// Then at cat.service.ts
import { HttpService } from '@bechara/nestjs-core';

@Injectable()
export class CatService {

  public constructor(
    private readonly httpService: HttpService,
  ) { }

  public async getCat(id: number) {
    const catData = await this.httpService.get('https://cats.com/cat/:id', {
      replacements: { id },
    });
    return catData;
  }
}
```

In a real world scenario, you will probable like to configure base params of the http service like url, headers, api keys, certificates, etc.

To be able to do this while acquiring this secrets in an async fashion, you may register the module as following:

```ts
// Async registration at cat.module.ts
import { HttpModule } from '@bechara/nestjs-core';

@Module({
  imports: [ 
    HttpModule.registerAsync({
      inject: [ CatConfig ],
      useFactory: (catConfig: CatConfig) => ({
        bases: {
          url: catConfig.CAT_API_URL,
          headers: { authorization: catConfig.CAT_API_KEY },
        },
        defaults: {
          timeout: 20 * 1000,
        },
        agent: {
          ignoreHttpErrors: true,
        }
      })
    })
  ],
  controller: [ CatController ],
  providers: [ CatConfig, CatService ],
  exports: [ CatConfig, CatService ],
})
export class CatModule { }
```


### Logger Module

Given an incoming message, broadcast it to all connected transports, which given their own configuration will decide whether or not to publish it on its channel.

**Methods**

Each method is related to its matching severity, and by default the publishing will occur as following according to environment:

Method | Local | Development | Staging | Production
:--- | :---: | :---: | :---: | :---:
`.critical()` | Console | Console<br>Sentry<br>Slack | Console<br>Sentry<br>Slack | Console<br>Sentry<br>Slack
`.error()` | Console | Console<br>Sentry<br>Slack | Console<br>Sentry<br>Slack | Console<br>Sentry<br>Slack
`.warning()` | Console | Console<br>Slack | Console<br>Slack | Console<br>Slack
`.notice()` | Console | Console | -  | -
`.info()` | Console | - | -  | -
`.http()` | Console | - | -  | -
`.debug()` | Console | - | -  | -

**Call Signatures**

The logging method expects the following typing:

```ts
log(level: LoggerLevel, message: string | Error, ...data: (Error | Record<string, any>)[]): void
```

When calling any of the methods previously listed, the `level` param will be populated accordingly and remaining data passed in order.

Which means you may call them in any combination of:

```ts
this.loggerService.error(a: string);
this.loggerService.error(a: string, b: Error);
this.loggerService.error(a: string, b: Object);
this.loggerService.error(a: Error, b: Object);
this.loggerService.error(a: string, b: Object, c: Object);
this.loggerService.error(a: string, b: Error, c: Object);
this.loggerService.error(a: Error, b: Object, c: Object);
// etc...
```

The framework will be responsible of identifying and parsing accordingly.

**Sentry Configuration**

To enable this integration it is mandatory to create a project at Sentry platform and provide its `SENTRY_DSN` as environment variable.

Keep in mind that it is unique for every project.

Variable | Type | Default
:--- | :---: | :---
SENTRY_DSN | string | `undefined`

**Slack Configuration**

To enable this integration it is mandatory to provide `SLACK_WEBHOOK` and `SLACK_CHANNEL`, you may customize it further with the following environment variables.

Variable | Type | Default
:--- | :---: | :---
SLACK_WEBHOOK | string | `undefined`
SLACK_CHANNEL | string | `undefined`
SLACK_USERNAME | string | Notification Bot
SLACK_ICON_URL | string | `undefined`

**Example**

```ts
import { LoggerService } from '@bechara/nestjs-core';

@Injectable()
export class CatService {

  public constructor(
    private readonly catRepository: Repository<CatEntity>,
    private readonly loggerService: LoggerService,
  ) { }

  public async getCat(id: number) {
    this.loggerService.debug(`Reading cat with id ${id}`);
    return this.catRepository.readById(id);
  }
}
```


### Util Module

Offers a set of methods that supports the other modules in this package, but may use be used by other applications.

- For static utilities (pre-boot) refer to [util.module.ts](source/util/util.module.ts).
- For injectable utilities (post-boot) refer to [util.service.ts](source/util/util.service.ts).

**Example**

```ts
import { UtilService } from '@bechara/nestjs-core';

@Injectable()
export class CatService {

  public constructor(
    private readonly catRepository: Repository<CatEntity>,
    private readonly utilService: UtilService,
  ) { }

  public async getCat(id: number) {
    return this.utilService.retryOnException({
      method: () => this.catRepository.readById(id),
      retries: 5,
    })
  }
}
```

### Test Module

Before proceeding, we recommend reading the official [NestJS testing documentation](https://docs.nestjs.com/fundamentals/testing#testing).

Since we are usually dealing with environment configurations, test boilerplating may become extensive.

With that in mind, you may optionally use the built-in `createSandbox()` method provided in the package.

**Example**

```ts
import { TestingModuleBuilder } from '@nestjs/testing';
import { TestModule } from '@bechara/nestjs-core/dist/test';

TestModule.createSandbox({
  name: 'CatService',
  imports: [ CatModule ],
  configs: [ CatConfig ],

  descriptor: (testingBuilder: TestingModuleBuilder) => {
    let catService: CatService;

    beforeAll(async () => {
      const testingModule = await testingBuilder.compile();
      catService = testingModule.get(CatService);
    });

    describe('readById', () => {
      it('should read a cat entity', async () => {
        const cat = catService.readById(1);
        expect(cat).toBe({ name: 'bob' });
      });
    });
  },

});
```

Basically, write your tests as you usually do but inside the `descriptor` property, which will always take a function that returns the Nest testing builder.

The difference is that we also expose the `imports`, `controllers`, `providers` and `configs` properties which allows you to simulate the necessary injections.

If you added the npm scripts from previous steps you may run all your tests with:

```
npm test
```

Alternatively, run a single by regex match:

```
npm test -- cat
```
