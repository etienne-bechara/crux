# Log Module

Offers a log service with predefined severity levels. When called, broadcasts the message to all connected transports and based on their own configuration decide whether or not to publish at it.

---

## Usage

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

---

## Call Signatures

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

---

## Transporters

This package offers the following built-in transporters: Console and Loki.

Configuration will be acquired from environment according to the following variables.

### Console

Print messages at stdout, enabled by default.

Variable         | Required | Type   | Default
:--------------- | :------: | :----: | :---
CONSOLE_SEVERITY | No       | string | `trace` when `NODE_ENV=local`, `warning` otherwise

### Loki

Publish logs to [Loki](https://grafana.com/oss/loki) by pushing through its API.

To enable this integration provide `LOKI_URL`, you may also provide basic auth credentials.

Variable      | Required | Type   | Default
:------------ | :------: | :----: | :---
LOKI_URL      | Yes      | string |
LOKI_USERNAME | No       | string |
LOKI_PASSWORD | No       | string |
LOKI_SEVERITY | No       | string | `debug`

---

[Back to title](../../README.md)
