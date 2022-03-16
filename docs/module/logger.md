# Logger Module

Offers a logger service with predefined severity levels. When called, broadcasts the message to all connected transports and based on their own configuration decide whether or not to publish at it.

---

## Usage

Inject `LoggerService` at your provide and call any of its method based on severity:

```ts
import { LoggerService } from '@bechara/nestjs-core';

@Injectable()
export class FooService {

  public constructor(
    private readonly fooRepository: Repository<FooEntity>,
    private readonly loggerService: LoggerService,
  ) { }

  public async readFooById(id: number) {
    let foo: FooEntity;
    this.loggerService.debug(`Reading foo with id ${id}`);

    try {
      foo = await this.FooRepository.readById(id);
    }
    catch (e) {
      this.loggerService.error(`Failed to read foo`, e, id);
      throw new InternalServerErrorException();
    }

    this.loggerService.notice(`Successfully read foo with id ${id}`);
    return foo;
  }
}
```

---

## Call Signatures

The logging method accepts multiples arguments of the following typing:

```ts
type LoggerArguments = string | Error | Record<string, any>;
```

Which means you may call them in any combination of:

```ts
this.loggerService.error(a: string);
this.loggerService.error(a: string, b: Error);
this.loggerService.error(a: string, b: Record<string, any>);
this.loggerService.error(a: Error, b: Record<string, any>);
this.loggerService.error(a: string, b: Record<string, any>, c: Record<string, any>);
this.loggerService.error(a: string, b: Error, c: Record<string, any>);
this.loggerService.error(a: Error, b: Record<string, any>, c: Record<string, any>);
this.loggerService.error(a: string, b: Error, c: Record<string, any>, d: Record<string, any>);
// etc...
```

---

## Transporters

This package offers 4 built-in transporters: Console, CSV, Sentry and Slack.

Configuration will be acquired from environment according to the following variables.

### Console

Print messages at stdout, enabled by default.

Variable         | Required | Type   | Default
:--------------- | :------: | :----: | :---
CONSOLE_SEVERITY | No       | string | `trace` when `NODE_ENV=local`, `warning` otherwise


### CSV

Stream logs to `*.csv` files at local disk.

To enable this integration configure any severity.

Variable     | Required  | Type   | Default
:----------- | :-------: | :----: | :---
CSV_SEVERITY | Yes       | string |


### Sentry

Publish logs to [Sentry](https://sentry.io) platform.

To enable this integration, create a project at Sentry and provide its `SENTRY_DSN`.

Variable        | Required | Type   | Default
:-------------- | :------: | :----: | :---
SENTRY_DSN      | Yes      | string |
SENTRY_SEVERITY | No       | string | `error`


### Slack

Publish logs to a [Slack](https://slack.com) channel through webhooks.

To enable this integration provide `SLACK_WEBHOOK` and `SLACK_CHANNEL`, you may also customize the username and icon when publishing the message.

Variable       | Required | Type   | Default
:------------- | :------: | :----: | :---
SLACK_WEBHOOK  | Yes      | string |
SLACK_CHANNEL  | Yes      | string |
SLACK_USERNAME | No       | string |
SLACK_ICON_URL | No       | string |
SLACK_SEVERITY | No       | string | `warning`

---

[Back to title](../../README.md)
