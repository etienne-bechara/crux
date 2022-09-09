import { Cache } from '../../../source/cache/cache.decorator';
import { CacheService } from '../../../source/cache/cache.service';
import { Controller, Get, Param } from '../../../source/override';

@Controller('bucket')
export class BucketController {

  public constructor(
    private readonly cacheService: CacheService,
  ) { }

  @Get('foo/:ids')
  @Cache({ ttl: 60_000 })
  public getBucketFooIds(@Param('ids') ids: string): { rng: number } {
    const buckets = ids.split(',');
    this.cacheService.setBucketsAsync(buckets);
    return { rng: Math.random() };
  }

  @Get('bar/:ids')
  @Cache({ ttl: 60_000 })
  public getBucketBarIds(@Param('ids') ids: string): { rng: number } {
    const buckets = ids.split(',');
    this.cacheService.setBucketsAsync(buckets);
    return { rng: Math.random() };
  }

}
