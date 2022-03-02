import { AppModule } from '../../source/app/app.module';
import { PostModule } from './post/post.module';
import { UserModule } from './user/user.module';

void AppModule.boot({
  disableScan: true,
  imports: [
    PostModule,
    UserModule,
  ],
});
