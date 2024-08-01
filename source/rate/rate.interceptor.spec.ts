/* eslint-disable max-len */
/* eslint-disable jsdoc/require-jsdoc */
import { Controller, Get, HttpStatus, INestApplication, Module } from '@nestjs/common';
import supertest from 'supertest';

import { AppModule } from '../app/app.module';
import { RateLimit } from './rate.decorator';

@Controller('rate')
class RateTestController {

  @RateLimit({ limit: 3 })
  @Get('limited')
  public getLimited(): { rng: number } {
    return { rng: Math.random() };
  }

  @Get('unlimited')
  public getUnlimited(): { rng: number } {
    return { rng: Math.random() };
  }

}

@Module({
  controllers: [
    RateTestController,
  ],
})
class RateTestModule { }

describe('RateInterceptor', () => {
  let app: INestApplication;
  let httpServer: any;

  beforeAll(async () => {
    app = await AppModule.boot({
      disableScan: true,
      disableLogs: true,
      disableMetrics: true,
      disableTraces: true,
      port: 0,
      imports: [ RateTestModule ],
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

  describe('GET /rate/limited', () => {
    it('should throw exception for rate limited endpoint', async () => {
      const res1 = await supertest(httpServer).get('/rate/limited').send();
      const res2 = await supertest(httpServer).get('/rate/limited').send();
      const res3 = await supertest(httpServer).get('/rate/limited').send();
      const res4 = await supertest(httpServer).get('/rate/limited').send();

      expect(res1.statusCode).toBe(HttpStatus.OK);
      expect(res2.statusCode).toBe(HttpStatus.OK);
      expect(res3.statusCode).toBe(HttpStatus.OK);
      expect(res4.statusCode).toBe(HttpStatus.TOO_MANY_REQUESTS);
    });
  });

  describe('GET /rate/unlimited', () => {
    it('should not throw exception for unlimited endpoint', async () => {
      const res1 = await supertest(httpServer).get('/rate/unlimited').send();
      const res2 = await supertest(httpServer).get('/rate/unlimited').send();
      const res3 = await supertest(httpServer).get('/rate/unlimited').send();
      const res4 = await supertest(httpServer).get('/rate/unlimited').send();

      expect(res1.statusCode).toBe(HttpStatus.OK);
      expect(res2.statusCode).toBe(HttpStatus.OK);
      expect(res3.statusCode).toBe(HttpStatus.OK);
      expect(res4.statusCode).toBe(HttpStatus.OK);
    });
  });
});
