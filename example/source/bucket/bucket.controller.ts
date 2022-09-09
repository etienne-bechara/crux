
import { Cache } from '../../../source/cache/cache.decorator';
import { CacheService } from '../../../source/cache/cache.service';
import { Controller, Delete, Get, Param } from '../../../source/override';

@Controller('bucket')
export class BucketController {

  public constructor(
    private readonly cacheService: CacheService,
  ) { }

  @Cache()
  @Get(':ids')
  public getBucketIds(@Param('ids') ids: string): { rng: number } {
    const buckets = ids.split(',');
    this.cacheService.setBuckets(buckets);
    return { rng: Math.random() };
  }

  @Delete(':ids')
  public deleteBucketIds(@Param('ids') ids: string): void {
    const buckets = ids.split(',');
    void this.cacheService.invalidateBucketsSync(buckets);
  }

}
