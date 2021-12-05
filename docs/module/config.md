# Configuration Module

Serves the purpose of allowing asynchronous secret population, it works along with `*.config.ts` files that contains the definition of injectable class.

Decorate a class with `@Config()` in order to mark it as a configuration definition. It will be available as a regular provider for NestJS injection.

Any property decorated with `@InjectSecret()` will have its value extracted from `process.env` and added to the class.

---

## Usage

Create a `*.config.ts` file declaring you configuration class with `@Config()` and decorate target properties with `@InjectSecret()`:

```ts
import { Config, InjectSecret } from '@bechara/nestjs-core';

@Config()
export class FooConfig {

  @InjectSecret()
  FOO_API_URL: string;

  // Use 'key' if the env variable has
  // a different name than the property.
  @InjectSecret({ key: 'foo_authorization' })
  FOO_API_KEY: string;

  // Use 'baseValue' to set a fallback value
  @InjectSecret({ baseValue: 15 })
  FOO_API_MAX_CONCURRENCY: number;

}
```

The framework also allows decoration of properties using `class-validator` and `class-transformer` to enforce validation of the value before initialization:

```ts
import { Config, InjectSecret } from '@bechara/nestjs-core';
import { IsUrl, IsString, Length } from 'class-validator';
import { Transform } from 'class-transformer';

@Config()
export class FooConfig {

  @InjectSecret()
  @IsUrl()
  FOO_API_URL: string;

  @InjectSecret({ key: 'foo_authorization' })
  @IsString() @Length(36)
  FOO_API_KEY: string;

  @InjectSecret({ baseValue: '15' })
  @Transform((v) => Number(v))
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

[Back to title](../../README.md)
