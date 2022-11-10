import { AppModule } from '../source/app/app.module';
import { UserModule } from './user/user.module';
import { ZipModule } from './zip/zip.module';

/**
 * Run with `pnpm dev`.
 *
 * Boots an example application with partial functionalities,
 * but pointing directly to source files enabling live reload.
 *
 * Useful when locally developing new core features.
 */
void AppModule.boot({
  disableScan: true,
  disableTraces: true,
  imports: [
    UserModule,
    ZipModule,
  ],
  docs: {
    tagGroups: [
      { name: 'User Management', tags: [ 'User' ] },
      { name: 'ZIP Code', tags: [ 'ZIP' ] },
    ],
    security: [
      {
        name: 'API Key',
        options: {
          type: 'apiKey',
          in: 'header',
          name: 'Authorization',
        },
      },
    ],
  },
});
