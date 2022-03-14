import { Module } from '../../../source/app/app.override';
import { ZipModule } from '../zip/zip.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [
    ZipModule,
  ],
  controllers: [
    UserController,
  ],
  providers: [
    UserService,
  ],
})
export class UserModule { }
