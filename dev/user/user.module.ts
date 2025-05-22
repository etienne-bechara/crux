import { Module } from '../../source/override';
import { UserController } from './user.controller';

@Module({
	controllers: [UserController],
})
export class UserModule {}
