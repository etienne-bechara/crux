# Http Module

Work as a wrapper of Axios library and exposes methods to make http requests.

The scope of this module is transient, which means one new instance will be provided every time it is injected.

In order to use it, you must register it in every module to which a provider will receive an instance of http service.

**Example**

First at `foo.module.ts`:

```ts
import { HttpModule } from '@bechara/nestjs-core';

@Module({
  imports: [ HttpModule.register() ],
  controller: [ FooController ],
  providers: [ FooService ],
})
export class FooModule { }
```

Then at `foo.service.ts`:

```ts
import { HttpService } from '@bechara/nestjs-core';

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
import { HttpModule } from '@bechara/nestjs-core';

@Module({
  imports: [ 
    HttpModule.registerAsync({
      inject: [ FooConfig ],
      useFactory: (fooConfig: FooConfig) => ({
        bases: {
          url: fooConfig.FOO_API_URL,
          headers: { authorization: fooConfig.FOO_API_KEY },
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
  controller: [ FooController ],
  providers: [ FooConfig, FooService ],
  exports: [ FooConfig, FooService ],
})
export class FooModule { }
```

## Module Options

The following options are available when registering the Http Module, everything is optional:

```ts
import { HttpModule, HttpReturnType, HttpExceptionHandler } from '@bechara/nestjs-core';

@Module({
  imports: [
    HttpModule.register({
      name: 'HttpModule',
      manual: false,
      silent: false,
      defaults: {
        returnType: HttpReturnType.FULL_RESPONSE,
        timeout: 15 * 1000,
        validator: (status: number) => true,
        exceptionHandler: HttpExceptionHandler.PROXY_HTTP_STATUS,
      },
      bases: {
        url: 'https://foo.com',
        headers: { },
        query: { },
        body: { },
      },
      agent: {
        custom: new https.Agent({ }),
        ignoreHttpErrors: true,
        ssl: {
          cert: 'base64string',
          key: 'base64string',
          passphrase: 'password',
        },
      },
      // You may use 'cache: true' to configure with default options
      // See axios-cache-adapter for full documentation
      cache: {
        maxAge: 15 * 60 * 1000,
        limit: 10000,
        store: new Redis(),
        key(req) => undefined,
        invalidate(cfg, req) => { },
        exclude: {
          paths: /public/g,
          query: false,
          filter: Function,
          methods: [ 'post', 'put' ],
        },
        clearOnStale: false,
        clearOnError: false,
        readOnError: false,
        readHeaders: false,
        ignoreCache: false,
        debug: false,
        excludeFromCache: false,
      },
    })
  ],
  controller: [ FooController ],
  providers: [ FooService ],
})
export class FooModule { }
```

---

[Next: Logger Module](logger.module.md)

[Back to title](../README.md)
