import { AppModule } from '../../source/app/app.module';
import { BucketModule } from './bucket/bucket.module';
import { RandomModule } from './random/random.module';
import { UserModule } from './user/user.module';
import { ZipModule } from './zip/zip.module';

/**
 * Run with `pnpm dev`.
 * Boots application with basic functionalities.
 *
 * In a real scenario the `AppModule` would be imported from `@bechara/nestjs-core`
 * and disabling scan as well as manually importing your modules unnecessary.
 */
void AppModule.boot({
  disableTraces: true,

  // Not required when running from another project
  disableScan: true,
  imports: [
    BucketModule,
    RandomModule,
    UserModule,
    ZipModule,
  ],
});
