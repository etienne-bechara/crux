# CRUX
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=crux&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=crux)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=crux&metric=coverage)](https://sonarcloud.io/summary/new_code?id=crux)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=crux&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=crux)
[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=crux&metric=reliability_rating)](https://sonarcloud.io/summary/new_code?id=crux)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=crux&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=crux)

A Node.js all-in-one opinionated package intended for backend projects.

- Framework: [NestJS](https://docs.nestjs.com/)
- HTTP Server: [Fastify](https://www.fastify.io/docs/latest/)
- HTTP Client: [GOT](https://github.com/sindresorhus/got)
- Caching: [ioredis](https://www.npmjs.com/package/ioredis) (distributed) or in-memory (local)
- ORM: [MikroORM](https://mikro-orm.io/docs/installation)
- Swagger: [Redoc](https://github.com/mxarc/nestjs-redoc)
- Logs: [Loki](https://grafana.com/docs/loki/latest/api/)
- Metrics: [Prometheus](https://github.com/siimon/prom-client)
- Tracing: [Tempo](https://grafana.com/docs/tempo/latest/api_docs/) with [OpenTelemetry](https://github.com/open-telemetry/opentelemetry-js)


### How to Use

- [Framework (New Projects)](docs/usage/framework.md)
- [Standalone (Existing Projects)](docs/usage/standalone.md)
- [Testing](docs/usage/test.md)

### Curated Modules

- [\[App\] Fastify Adapter](docs/module/app.md)
- [\[Cache\] Inbound Caching](docs/module/cache.md)
- [\[Config\] Environment Variables](docs/module/config.md)
- [\[Context\] Request, Response and Metadata](docs/module/context.md)
- [\[Doc\] Redoc and OpenAPI](docs/module/doc.md)
- [\[Http\] GOT Client](docs/module/http.md)
- [\[Log\] Loki](docs/module/log.md)
- [\[Memory\] Volatile Storage with TTL](docs/module/memory.md)
- [\[Metric\] Prometheus](docs/module/metric.md)
- [\[ORM\] Prometheus](docs/module/orm.md)
- [\[Promise\] Retry, Timeout and Limiting](docs/module/promise.md)
- [\[Trace\] Open Telemetry](docs/module/trace.md)

### Dependencies

This framework is frequently revised in order to keep dependencies up to date.

However, the following packages are currently behind latest version:
- `@fastify/static@6.10.2`: Latest requires `fastify@4.23.0`, but `@nestjs/platform-fastify` uses `fastify@4.22.2`,
- `httpsnippet@2.0.0`: Latest crashes `configureDocumentation()` when `NODE_ENV=production`
- `got@11.8.5`: Latest requires ESM
- `query-string@7.1.3` Latest requires ESM
