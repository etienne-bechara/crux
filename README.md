⚠️ **Disclaimer**: This project is opinionated and intended for personal use.

---

# NestJS Core Components

This package offers a wrapper around NestJS core components adding extra functionalities commonly found across back-end projects.

### How to Use

- [As Framework (New Projects)](docs/usage/framework.md)
- [In Standalone (Existing Projects)](docs/usage/standalone.md)

### Curated Modules

- [Application (Fastify)](docs/module/app.md)
- [Configuration](docs/module/config.md)
- [Context (Request, Response and Metadata)](docs/module/context.md)
- [HTTP (GOT)](docs/module/http.md)
- [Logger (Console, Slack and Sentry)](docs/module/logger.md)
- [Metric (Prometheus)](source/metric/metric.service.ts) _pending detailed documentation_
- [Async (Sleep, Exception Retry and Promise Limit)](source/async/async.service.ts) _pending detailed documentation_
- [Crypto (Encrypt With or Without IV and Decrypt)](source/crypto/crypto.service.ts) _pending detailed documentation_
- [Storage (Memory Store with TTL)](source/storage/storage.service.ts) _pending detailed documentation_

### Recipes

- [Testing](docs/recipe/test.md)
- [Swagger](docs/recipe/swagger.md)
