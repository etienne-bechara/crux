import { AppModule } from '../../../source/app/app.module';
import { BucketModule } from './bucket/bucket.module';
import { RandomModule } from './random/random.module';
import { UserModule } from './user/user.module';
import { ZipModule } from './zip/zip.module';

/**
 * Run with `pnpm dev`.
 * Boots application with full functionalities.
 */
void AppModule.boot({
  name: 'crux',
  cache: {
    host: 'localhost',
    port: 6379,
  },
  loki: {
    url: 'http://localhost:3100/loki/api/v1/push',
    pushInterval: 5000,
  },
  metrics: {
    url: 'http://127.0.0.1:9090/api/v1/write',
    pushInterval: 5000,
  },
  traces: {
    url: 'http://127.0.0.1:55681/v1/traces',
    pushInterval: 5000,
  },
  docs: {
    tagGroups: [
      { name: 'User', tags: [ 'user' ] },
    ],
  },

  // Since we are running using files from package source we must disable the
  // module scanning and manually import example modules
  disableScan: true,
  imports: [
    BucketModule,
    RandomModule,
    UserModule,
    ZipModule,
  ],
});
