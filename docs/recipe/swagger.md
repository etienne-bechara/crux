# Swagger

NestJS allows to automatically generate a hosted Swagger based documentation by annotating your routes with custom decorators.

In order to do so with this framework, you must precede your `AppModule` call to `boot()` with a `compile()`.

---

## Usage

1\. Install the required packages and annotate your desired routes according to official [NestJS - OpenAPI](https://docs.nestjs.com/openapi/introduction) documentation.

2\. Find your `AppModule.boot()` call, usually at `main.ts`:

```ts
import { AppModule } from '@bechara/nestjs-core';

void AppModule.boot();
```

And replace it with:

```ts
import { AppModule } from '@bechara/nestjs-core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await AppModule.compile();

  const config = new DocumentBuilder().setTitle('Foo API').build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await AppModule.boot({ instance: app });
}

void bootstrap();
```

3\. Boot the application and navigate to `http://localhost:8080/docs` to see your docs in action.

---

[Back to title](../../README.md)
