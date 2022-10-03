import { Module } from '@bechara/crux';

import { UserController } from './user.controller';

@Module({
  controllers: [
    UserController,
  ],
})
export class UserModule { }
