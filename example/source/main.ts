import { AppModule } from '../../source/app/app.module';
import { RandomModule } from './random/random.module';
import { UserModule } from './user/user.module';
import { ZipModule } from './zip/zip.module';

void AppModule.boot({
  job: 'nestjs-example',
  disableScan: true,
  imports: [
    RandomModule,
    UserModule,
    ZipModule,
  ],
  // loki: {
  //   url: 'http://localhost:3100',
  //   pushInterval: 5000,
  // },
  // metrics: {
  //   url: 'http://127.0.0.1:9091',
  //   pushInterval: 5000,
  // },
  traces: {
    url: 'http://127.0.0.1:55681',
    pushInterval: 5000,
  },
});
