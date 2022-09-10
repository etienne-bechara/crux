# CRUX

A Node.js all-in-one opinionated package intended for backend projects.

- Framework: [NestJS](https://docs.nestjs.com/)
- HTTP Server: [Fastify](https://www.fastify.io/docs/latest/)
- HTTP Client: [GOT](https://github.com/sindresorhus/got)
- HTTP Caching: [ioredis](https://www.npmjs.com/package/ioredis) (distributed) or in-memory (local)
- Swagger Documentation: [Redoc](https://github.com/mxarc/nestjs-redoc)
- Logs: [Loki](https://grafana.com/docs/loki/latest/api/) and [Slack](https://api.slack.com/messaging/webhooks)
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
- [\[Log\] Console, Loki, and Slack](docs/module/log.md)
- [\[Memory\] Volatile Storage with TTL](docs/module/memory.md)
- [\[Metric\] Prometheus](docs/module/metric.md)
- [\[Promise\] Retry, Timeout and Limiting](docs/module/promise.md)
- [\[Trace\] Open Telemetry](docs/module/trace.md)
