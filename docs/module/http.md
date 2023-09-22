# Http Module

Work as a wrapper of Node.js Fetch API and exposes methods to make http requests.

The scope of this module is transient, which means one new instance will be provided every time it is injected.

---

## Usage

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

[Back to title](../../README.md)
