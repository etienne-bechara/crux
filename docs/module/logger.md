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

This package offers 3 built-in transporters: Console, Sentry and Slack.

Configuration will be acquired from environment according to the following variables.

### Console

Basic integration with terminal, level can be configured by environment.

Variable | Mandatory | Type | Default
:--- | :---: | :---: | :---
CONSOLE_SEVERITY | No | string | See [console.config.ts](../../source/console/console.config.ts)


### Sentry

To enable this integration it is mandatory to create a project at Sentry platform and provide its `SENTRY_DSN`.

Keep in mind that this should be unique for every project.

Variable | Mandatory | Type | Default
:--- | :---: | :---: | :---
SENTRY_DSN | Yes | string | `undefined`
SENTRY_SEVERITY | No | string | See [sentry.config.ts](../../source/logger/sentry/sentry.config.ts)


### Slack

To enable this integration it is mandatory to provide `SLACK_WEBHOOK` and `SLACK_CHANNEL`, you may also customize the username and icon when publishing the message.

Variable | Mandatory | Type | Default
:--- | :---: | :---: | :---
SLACK_WEBHOOK | Yes | string | `undefined`
SLACK_CHANNEL | Yes | string | `undefined`
SLACK_USERNAME | No | string | Notification Bot
SLACK_ICON_URL | No | string | `undefined`
SLACK_SEVERITY | No | string | See [slack.config.ts](../../source/slack/slack.config.ts)

---

## Severity Levels

The table below describes each available severity as well as the default configuration for deciding between publishing or not at one of the providers.

Severity | Local | Development | Staging | Production
:--- | :---: | :---: | :---: | :---:
Fatal | Console | Console<br>Sentry<br>Slack | Console<br>Sentry<br>Slack | Console<br>Sentry<br>Slack
Error | Console | Console<br>Sentry<br>Slack | Console<br>Sentry<br>Slack | Console<br>Sentry<br>Slack
Warning | Console | Console<br>Slack | Console<br>Slack | Console<br>Slack
Notice | Console | - | -  | -
Info | Console | - | - | -
Http | Console | - | - | -
Debug | Console | - | - | -
Trace | Console | - | - | -

---

[Back to title](../../README.md)
