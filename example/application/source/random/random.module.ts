import { HttpModule, Module } from '@bechara/crux';

import { RandomController } from './random.controller';
import { RandomService } from './random.service';

@Module({
  imports: [
    HttpModule.register(),
  ],
  controllers: [
    RandomController,
  ],
  providers: [
    RandomService,
  ],
})
export class RandomModule { }
