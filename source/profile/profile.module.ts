import { Module } from '@nestjs/common';

import { ProfileConfig } from './profile.config';
import { ProfileService } from './profile.service';

@Module({
  providers: [
    ProfileConfig,
    ProfileService,
  ],
  exports: [
    ProfileConfig,
    ProfileService,
  ],
})
export class ProfileModule { }
