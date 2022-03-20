import { HttpStatus, Injectable, Module } from '@nestjs/common';

import { AppModule } from '../app/app.module';
import { AppService } from '../app/app.service';
import { HttpRequestParams, HttpResponse } from './http.interface';
import { HttpModule } from './http.module';
import { HttpService } from './http.service';

@Injectable()
class JsonService {

  public constructor(
    private readonly httpService: HttpService,
  ) { }

}

@Module({
  imports: [
    HttpModule.register({
      prefixUrl: 'https://jsonplaceholder.typicode.com',
      resolveBodyOnly: true,
      responseType: 'json',
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

describe('HttpService', () => {
  let appHttpService: HttpService;
  let jsonHttpService: HttpService;

  beforeAll(async () => {
    const app = await AppModule.compile({
      disableAll: true,
      imports: [ JsonModule ],
    });

    appHttpService = app.get(AppService)['httpService'];
    jsonHttpService = app.get(JsonService)['httpService'];
  });

  describe('get', () => {
    it('should read a placeholder resource', async () => {
      const mockPost = {
        userId: 1,
        id: 1,
        title: 'sunt aut facere repellat provident occaecati excepturi optio reprehenderit',
      };

      const data = await jsonHttpService.get('posts/:id', {
        replacements: { id: '1' },
      });

      expect(data).toMatchObject(mockPost);
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

      expect(Object.keys(data).length).toBe(0);
    });
  });

  describe('request', () => {
    it('should throw a timeout exception', async () => {
      let errorMessage: string;

      try {
        await jsonHttpService.get('posts', { timeout: 1 });
      }
      catch (e) {
        errorMessage = e.message;
      }

      expect(errorMessage).toMatch(/timeout/gi);
    });

    it('should throw an internal server error exception', async () => {
      let errorStatus: number;

      try {
        await jsonHttpService.get('404');
      }
      catch (e) {
        errorStatus = e.status;
      }

      expect(errorStatus).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('should throw a not found exception', async () => {
      let errorStatus: number;

      try {
        await jsonHttpService.get('404', { proxyExceptions: true });
      }
      catch (e) {
        errorStatus = e.status;
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
      const res: HttpResponse<string> = await appHttpService.get('https://www.google.com', {
        responseType: 'text',
        resolveBodyOnly: false,
      });

      expect(res.cookies[0]).toBeDefined();
      expect(res.cookies[0].domain).toMatch(/google/g);
      expect(res.cookies[0].expires).toBeInstanceOf(Date);
    });
  });

  describe('buildRequestParams', () => {
    it('should join query string arrays into string', () => {
      const params: HttpRequestParams = {
        query: {
          string: 'string',
          stringArray: [ 'string', 'string' ],
          test: [ 'test1', 'test2', 'test3' ],
        },
        querySeparator: '|',
      };

      const expectation = {
        string: 'string',
        stringArray: 'string|string',
        test: 'test1|test2|test3',
      };

      const result = appHttpService['buildRequestParams'](params);
      expect(result.searchParams).toStrictEqual(expectation);
    });
  });
});
