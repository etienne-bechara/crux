import { AppModule } from '../../source/app/app.module';
import { PostModule } from './post/post.module';
import { UserModule } from './user/user.module';

void AppModule.boot({
  disableScan: true,
  imports: [
    PostModule,
    UserModule,
  ],
  // Aggregating pushgateway example
  metrics: {
    job: 'metrics-demo',
    pushgatewayUrl: 'http://127.0.0.1:9091',
    pushgatewayInterval: 5000,
    pushgatewayReset: true,
  },
});
