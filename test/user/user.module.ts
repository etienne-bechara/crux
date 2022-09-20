import { Module } from '@nestjs/common';

import { UserController } from './user.controller';
import { UserSubscriber } from './user.subscriber';

@Module({
  controllers: [
    UserController,
  ],
  providers: [
    UserSubscriber,
  ],
})
export class UserModule { }
