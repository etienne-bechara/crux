import { Cache, CacheService, Controller, Delete, Get, Param } from '@bechara/crux';
import crypto from 'crypto';

@Controller('bucket')
export class BucketController {

  public constructor(
    private readonly cacheService: CacheService,
  ) { }

  @Cache()
  @Get(':ids')
  public getBucketIds(@Param('ids') ids: string): Record<string, any> {
    const buckets = ids.split(',');
    this.cacheService.setBuckets(buckets);

    return {
      buckets,
      randomNumber: Math.random(),
      randomString: crypto.randomBytes(50_000).toString('hex'),
    };
  }

  @Delete(':ids')
  public deleteBucketIds(@Param('ids') ids: string): void {
    const buckets = ids.split(',');
    this.cacheService.invalidateBuckets(buckets);
  }

}
