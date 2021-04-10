# Configuration Module

Serves the purpose of allowing asynchronous secret population, it works along with `*.config.ts` files that contains the definition of injectable class.

Any property decorated with `@InjectSecret()` will have its value extracted from `process.env` and added to the class.

**Example**

```ts
import { InjectSecret } from '@bechara/nestjs-core';

@Injectable()
export class FooConfig {

  @InjectSecret()
  FOO_API_URL: string;

  // Use 'key' if the env variable has
  // a different name than the property.
  @InjectSecret({ key: 'foo_authorization' })
  FOO_API_KEY: string;

  // Use 'default' to set a fallback value
  @InjectSecret({ default: 15 })
  FOO_API_MAX_CONCURRENCY: number;

}
```

The framework also allows decoration of properties using `class-validator` and `class-transformer` to enforce validation of the value before initialization:

**Example**

```ts
import { InjectSecret } from '@bechara/nestjs-core';
import { IsUrl, IsString, Length } from 'class-validator';
import { Transform } from 'class-transformer';

@Injectable()
export class FooConfig {

  @InjectSecret()
  @IsUrl()
  FOO_API_URL: string;

  @InjectSecret({ key: 'foo_authorization' })
  @IsString() @Length(36)
  FOO_API_KEY: string;

  @InjectSecret({ default: '15' })
  @Transform((v) => Number.parseInt(v))
  @IsNumber()
  FOO_API_MAX_CONCURRENCY: number;

}
```

Finally, to use the secrets, you must add the configuration class to the array of providers of your module and inject it into your service:

**Example**

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

[Next: Http Module](http.module.md)

[Back to title](../README.md)
