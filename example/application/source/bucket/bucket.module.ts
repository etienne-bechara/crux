import { Module } from '@bechara/crux';

import { BucketController } from './bucket.controller';

@Module({
  controllers: [
    BucketController,
  ],
})
export class BucketModule { }
