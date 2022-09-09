import { AppModule } from '../../source/app/app.module';
import { BucketModule } from './bucket/bucket.module';
import { RandomModule } from './random/random.module';
import { UserModule } from './user/user.module';
import { ZipModule } from './zip/zip.module';

/**
 * Run with `pnpm telemetry`.
 * Boots application with full telemetry functionalities.
 */
void AppModule.boot({
  name: 'crux',
  disableScan: true,
  imports: [
    BucketModule,
    RandomModule,
    UserModule,
    ZipModule,
  ],
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
});
