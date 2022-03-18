import { AppModule } from '../../source/app/app.module';
import { UserModule } from './user/user.module';
import { ZipModule } from './zip/zip.module';

void AppModule.boot({
  job: 'nestjs-example',
  disableScan: true,
  imports: [
    UserModule,
    ZipModule,
  ],
  // Aggregating pushgateway example
  metrics: {
    // pushgatewayUrl: 'http://127.0.0.1:9091',
    pushgatewayInterval: 5000,
  },
});
