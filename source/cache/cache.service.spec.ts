/* eslint-disable max-len */
/* eslint-disable jsdoc/require-jsdoc */
import { Controller, Get, HttpStatus, INestApplication, Module, Patch } from '@nestjs/common';
import supertest from 'supertest';
import { setTimeout } from 'timers/promises';

import { AppModule } from '../app/app.module';
import { Cache } from './cache.decorator';

@Controller('cache')
class CacheTestController {

  @Cache({
    ttl: 1000,
    buckets: () => [ ],
  })
  @Get('no-buckets')
  public getCacheNoBuckets(): { rng: number } {
    return { rng: Math.random() };
  }

  @Cache({
    ttl: 1000,
    buckets: ({ req }) => [ req.params.id, '10' ],
  })
  @Get(':id')
  public getCacheById(): { rng: number } {
    return { rng: Math.random() };
  }

  @Cache({
    invalidate: ({ req }) => [ req.params.id ],
  })
  @Patch(':id')
  public patchCache(): void {
    return;
  }

}

@Module({
  controllers: [
    CacheTestController,
  ],
})
class CacheTestModule { }

describe('CacheService', () => {
  let app: INestApplication;
  let httpServer: any;

  beforeAll(async () => {
    app = await AppModule.boot({
      disableScan: true,
      disableLogs: true,
      disableMetrics: true,
      disableTraces: true,
      port: 0,
      imports: [ CacheTestModule ],
      cache: {
        host: 'localhost',
        port: 6379,
      },
    });

    httpServer = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /cache/:id', () => {
    it('should not cache response when no buckets are specified', async () => {
      const res1 = await supertest(httpServer).get('/cache/no-buckets').send();
      const res2 = await supertest(httpServer).get('/cache/no-buckets').send();

      expect(res1.statusCode).toBe(HttpStatus.OK);
      expect(res2.statusCode).toBe(HttpStatus.OK);
      expect(res1.body.rng === res2.body.rng).toBe(false);
    });

    it('should cache response using id as bucket', async () => {
      const res1 = await supertest(httpServer).get('/cache/1').send();
      const res2 = await supertest(httpServer).get('/cache/1').send();

      expect(res1.statusCode).toBe(HttpStatus.OK);
      expect(res2.statusCode).toBe(HttpStatus.OK);
      expect(res1.body.rng === res2.body.rng).toBe(true);
    });

    it('should invalidate cache after ttl has elapsed', async () => {
      const res1 = await supertest(httpServer).get('/cache/2').send();
      await setTimeout(1500);
      const res2 = await supertest(httpServer).get('/cache/2').send();

      expect(res1.statusCode).toBe(HttpStatus.OK);
      expect(res2.statusCode).toBe(HttpStatus.OK);
      expect(res1.body.rng === res2.body.rng).toBe(false);
    });

    it('should invalidate cache using id as bucket', async () => {
      const res1 = await supertest(httpServer).get('/cache/3').send();

      await supertest(httpServer).patch('/cache/3').send();
      await setTimeout(200);

      const res2 = await supertest(httpServer).get('/cache/3').send();

      expect(res1.statusCode).toBe(HttpStatus.OK);
      expect(res2.statusCode).toBe(HttpStatus.OK);
      expect(res1.body.rng === res2.body.rng).toBe(false);
    });

    it('should invalidate cache using an indirect bucket', async () => {
      const res1 = await supertest(httpServer).get('/cache/4').send();

      await supertest(httpServer).patch('/cache/10').send();
      await setTimeout(200);

      const res2 = await supertest(httpServer).get('/cache/4').send();

      expect(res1.statusCode).toBe(HttpStatus.OK);
      expect(res2.statusCode).toBe(HttpStatus.OK);
      expect(res1.body.rng === res2.body.rng).toBe(false);
    });
  });
});
