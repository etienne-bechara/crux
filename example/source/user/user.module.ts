import { Module } from '@nestjs/common';

import { HttpModule } from '../../../source/http/http.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [
    HttpModule.register({
      prefixUrl: 'https://jsonplaceholder.typicode.com',
      resolveBodyOnly: true,
      responseType: 'json',
    }),
  ],
  controllers: [
    UserController,
  ],
  providers: [
    UserService,
  ],
  exports: [
    UserService,
  ],
})
export class UserModule { }
