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
  logger: {
    lokiUrl: 'http://localhost:3100',
    lokiBatchSize: 1,
  },
  metrics: {
    pushgatewayUrl: 'http://127.0.0.1:9091',
    pushgatewayInterval: 5000,
  },
});
