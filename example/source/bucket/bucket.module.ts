import { Module } from '../../../source/override';
import { BucketController } from './bucket.controller';

@Module({
  controllers: [
    BucketController,
  ],
})
export class BucketModule { }
