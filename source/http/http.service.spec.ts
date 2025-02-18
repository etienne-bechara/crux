import { HttpStatus, Injectable, Module } from '@nestjs/common';
import { setTimeout } from 'timers/promises';

import { AppModule } from '../app/app.module';
import { HttpError, HttpResponse } from './http.interface';
import { HttpModule } from './http.module';
import { HttpService } from './http.service';

@Injectable()
class JsonService {

  public constructor(
    private readonly httpService: HttpService,
  ) { }

}

@Injectable()
class GoogleService {

  public constructor(
    private readonly httpService: HttpService,
  ) { }

}

@Module({
  imports: [
    HttpModule.register({
      baseUrl: 'https://jsonplaceholder.typicode.com',
      cacheTtl: 1000,
    }),
  ],
  providers: [
    JsonService,
  ],
  exports: [
    JsonService,
  ],
})
class JsonModule { }

@Module({
  imports: [
    HttpModule.register({
      baseUrl: 'https://www.google.com',
    }),
  ],
  providers: [
    GoogleService,
  ],
  exports: [
    GoogleService,
  ],
})
class GoogleModule { }

describe('HttpService', () => {
  let googleHttpService: HttpService;
  let jsonHttpService: HttpService;

  beforeAll(async () => {
    const app = await AppModule.compile({
      disableScan: true,
      disableLogs: true,
      disableMetrics: true,
      disableTraces: true,
      imports: [ GoogleModule, JsonModule ],
    });

    jsonHttpService = app.get(JsonService)['httpService'];
    googleHttpService = app.get(GoogleService)['httpService'];
  });

  describe('get', () => {
    it('should read a placeholder resource', async () => {
      const data = await jsonHttpService.get('posts/:id', {
        replacements: { id: '1' },
      });

      expect(data).toMatchObject({
        userId: 1,
        id: 1,
        title: 'sunt aut facere repellat provident occaecati excepturi optio reprehenderit',
      });
    });

    it('should read a cached resource', async () => {
      await setTimeout(100);
      const start = Date.now();

      const data = await jsonHttpService.get('posts/:id', {
        replacements: { id: '1' },
      });

      expect(Date.now() - start).toBeLessThan(10);

      expect(data).toMatchObject({
        userId: 1,
        id: 1,
        title: 'sunt aut facere repellat provident occaecati excepturi optio reprehenderit',
      });
    });

    it('should read in real time a previously cached resource', async () => {
      await setTimeout(1000);
      const start = Date.now();

      const data = await jsonHttpService.get('posts/:id', {
        replacements: { id: '1' },
      });

      expect(Date.now() - start).toBeGreaterThan(10);

      expect(data).toMatchObject({
        userId: 1,
        id: 1,
        title: 'sunt aut facere repellat provident occaecati excepturi optio reprehenderit',
      });
    });
  });

  describe('post', () => {
    it('should create a placeholder resource', async () => {
      const mockPost = {
        title: 'foo',
        body: 'bar',
        userId: 1,
      };

      const data = await jsonHttpService.post('posts', { json: mockPost });
      expect(data).toMatchObject(mockPost);
    });
  });

  describe('delete', () => {
    it('should remove a placeholder resource', async () => {
      const data = await jsonHttpService.delete('posts/:postId', {
        replacements: { postId: '1' },
      });

      expect(Object.keys(data || { }).length).toBe(0);
    });
  });

  describe('request', () => {
    it('should throw a timeout exception', async () => {
      let errorMessage: string | undefined;

      try {
        await jsonHttpService.get('posts', { timeout: 1 });
      }
      catch (e) {
        errorMessage = (e as Error).message;
      }

      expect(errorMessage?.includes('Request timed out after')).toBe(true);
    });

    it('should throw an internal server error exception', async () => {
      let errorStatus: number | undefined;

      try {
        await jsonHttpService.get('404');
      }
      catch (e) {
        errorStatus = (e as HttpError).status;
      }

      expect(errorStatus).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('should throw a not found exception', async () => {
      let errorStatus: number | undefined;

      try {
        await jsonHttpService.get('404', { proxyExceptions: true });
      }
      catch (e) {
        errorStatus = (e as HttpError).status;
      }

      expect(errorStatus).toEqual(HttpStatus.NOT_FOUND);
    });

    it('should retry on exception', async () => {
      const start = Date.now();
      const retryTime = 1000 + 2000;

      try {
        await jsonHttpService.get('404', {
          retryLimit: 2,
          retryCodes: [ HttpStatus.NOT_FOUND ],
        });
      }
      catch {
        // Silent fail
      }

      expect(Date.now()).toBeGreaterThan(start + retryTime);
    });

    it('should not retry on exception', async () => {
      const start = Date.now();
      const retryTime = 1000 + 2000;

      try {
        await jsonHttpService.get('404', {
          retryLimit: 2,
        });
      }
      catch {
        // Silent fail
      }

      expect(Date.now()).toBeLessThan(start + retryTime);
    });
  });

  describe('parseCookies', () => {
    it('should parse cookies from response headers', async () => {
      const res: HttpResponse = await googleHttpService.get('', {
        fullResponse: true,
      });

      expect(res.cookies?.[0]).toBeDefined();
      expect(res.cookies?.[0].domain).toMatch(/google/g);
      expect(res.cookies?.[0].expires).toBeInstanceOf(Date);
    });
  });
});
