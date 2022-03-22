# Standalone Usage

Uses `AppModule.compile()` to build core providers without serving an adapter.

---

## Installation

1\. Install the package into your existing project:

```sh
npm i -E @bechara/nestjs-core
```

2\. Add the following code at your bootstrap:

```ts
import { AppModule } from '@bechara/nestjs-core';

async function bootstrap() {
  // ...

  const app = await AppModule.compile();

  // ...
}
```

3\. Acquire the providers you would like to use by calling `.get()` method of compile application:

```ts
// Compile app
const app = await AppModule.compile();

// Acquire providers
const appService = app.get(AppService);
const logService = app.get(LogService);

// Use providers
const appStatus = appService.getStatus();
logService.warn(appStatus);
```

---

[Back to title](../../README.md)
