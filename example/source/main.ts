import { AppModule } from '../../source/app/app.module';
import { UserModule } from './user/user.module';
import { ZipModule } from './zip/zip.module';

void AppModule.boot({
  disableScan: true,
  imports: [
    UserModule,
    ZipModule,
  ],
  // Aggregating pushgateway example
  metrics: {
    job: 'metrics-demo',
    pushgatewayUrl: 'http://127.0.0.1:9091',
    pushgatewayInterval: 5000,
    pushgatewayReset: true,
  },
});
