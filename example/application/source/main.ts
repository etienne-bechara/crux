import { AppModule } from '@bechara/crux';

/**
 * Run with `pnpm example`.
 * Boots application with full functionalities.
 */
void AppModule.boot({
  name: 'crux',
  cache: {
    host: 'redis',
    port: 6379,
  },
  loki: {
    url: 'http://loki:3100/loki/api/v1/push',
    pushInterval: 5000,
  },
  metrics: {
    url: 'http://prometheus:9090/api/v1/write',
    pushInterval: 5000,
  },
  traces: {
    url: 'http://tempo:55681/v1/traces',
    pushInterval: 5000,
  },
  docs: {
    tagGroups: [
      { name: 'User', tags: [ 'user' ] },
    ],
  },
});
