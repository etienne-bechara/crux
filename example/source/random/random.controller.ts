import { Controller, Get } from '../../../source/app/app.override';
import { RandomService } from './random.service';

@Controller('random', {
  hidden: true,
})
export class RandomController {

  public constructor(
    private readonly randomService: RandomService,
  ) { }

  @Get()
  public getRandom(): Promise<any> {
    return this.randomService.doRandom();
  }

}
