# Logger Module

Offers a logger service with predefined severity levels. When called, broadcasts the message to all connected transports and based on their own configuration decide whether or not to publish at it.

## General Usage

Inject `LoggerService` at your provide and call any of its method based on severity.

**Example** 

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

## Call Signatures

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
this.loggerService.error(a: string, b: Error, c: Object, d: Object);
// etc...
```

## Transporters

This package offers 3 built-in transporters: Console, Sentry and Slack.

Configuration will be acquired from environment according to the following variables.

### Sentry

To enable this integration it is mandatory to create a project at Sentry platform and provide its `SENTRY_DSN`.

Keep in mind that this should be unique for every project.

Variable | Mandatory | Type | Default
:--- | :---: | :---: | :---
SENTRY_DSN | Yes | string | `undefined`

### Slack

To enable this integration it is mandatory to provide `SLACK_WEBHOOK` and `SLACK_CHANNEL`, you may also customize the username and icon when publishing the message.

Variable | Mandatory | Type | Default
:--- | :---: | :---: | :---
SLACK_WEBHOOK | Yes | string | `undefined`
SLACK_CHANNEL | Yes | string | `undefined`
SLACK_USERNAME | No | string | Notification Bot
SLACK_ICON_URL | No | string | `undefined`


## Severity Levels

The table below describes each available severity as well as the default configuration for deciding between publishing or not at one of the providers.

Severity | Local | Development | Staging | Production
:--- | :---: | :---: | :---: | :---:
Critical | Console | Console<br>Sentry<br>Slack | Console<br>Sentry<br>Slack | Console<br>Sentry<br>Slack
Error | Console | Console<br>Sentry<br>Slack | Console<br>Sentry<br>Slack | Console<br>Sentry<br>Slack
Warning | Console | Console<br>Slack | Console<br>Slack | Console<br>Slack
Notice | Console | Console | -  | -
Info | Console | - | - | -
Http | Console | - | - | -
Debug | Console | - | - | -

---

[Next: Test Module](test.module.md)

[Back to title](../README.md)
