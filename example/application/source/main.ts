import { AppModule, OrmModule } from '@bechara/crux';

/**
 * Run with `pnpm example`.
 *
 * Boots an example application with full functionalities,
 * including distributed caching and observability platform.
 *
 * Useful to debug behaviour at end product and interactions
 * with other technologies.
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
    url: 'http://tempo:4317/v1/traces',
    pushInterval: 5000,
  },
  profiles: {
    url: 'http://pyroscope:4040',
  },
  docs: {
    tagGroups: [
      { name: 'User Management', tags: [ 'User' ] },
      { name: 'ZIP Code', tags: [ 'ZIP' ] },
    ],
  },
  imports: [
    OrmModule.registerAsync({
      useFactory: () => ({
        type: 'postgresql',
        host: 'postgres',
        port: 5432,
        dbName: 'crux',
        user: 'postgres',
        password: 'password',
        sync: { auto: true },
      }),
    }),
  ],
  exports: [
    OrmModule,
  ],
});
