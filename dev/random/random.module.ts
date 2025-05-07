import { HttpModule, Module } from '../../source/override';
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
