import { HttpStatus } from '@nestjs/common';
import { TestingModuleBuilder } from '@nestjs/testing';

import { TestModule } from '../test';
import { HttpResponse } from './http.interface';
import { HttpModule } from './http.module';
import { HttpService } from './http.service';

TestModule.createSandbox({
  name: 'HttpService (JSON)',

  imports: [
    HttpModule.register({
      prefixUrl: 'https://jsonplaceholder.typicode.com',
      resolveBodyOnly: true,
      responseType: 'json',
    }),
  ],

  descriptor: (testingBuilder: TestingModuleBuilder) => {
    let httpService: HttpService;

    beforeAll(async () => {
      const testingModule = await testingBuilder.compile();
      httpService = await testingModule.resolve(HttpService);
    });

    describe('get', () => {
      it('should read a placeholder resource', async () => {
        const mockPost = {
          userId: 1,
          id: 1,
          title: 'sunt aut facere repellat provident occaecati excepturi optio reprehenderit',
        };

        const data = await httpService.get('posts/:id', {
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

        const data = await httpService.post('posts', { json: mockPost });
        expect(data).toMatchObject(mockPost);
      });
    });

    describe('delete', () => {
      it('should remove a placeholder resource', async () => {
        const data = await httpService.delete('posts/:postId', {
          replacements: { postId: '1' },
        });

        expect(Object.keys(data).length).toBe(0);
      });
    });

    describe('request', () => {
      it('should throw a timeout exception', async () => {
        let errorMessage: string;

        try {
          await httpService.get('posts', { timeout: 1 });
        }
        catch (e) {
          errorMessage = e.message;
        }

        expect(errorMessage).toMatch(/timeout/gi);
      });

      it('should throw an internal server error exception', async () => {
        let errorStatus: number;

        try {
          await httpService.get('404');
        }
        catch (e) {
          errorStatus = e.status;
        }

        expect(errorStatus).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
      });
    });
  },

});

TestModule.createSandbox({
  name: 'HttpService (Proxy)',

  imports: [
    HttpModule.register({
      proxyException: true,
      prefixUrl: 'https://jsonplaceholder.typicode.com',
      resolveBodyOnly: true,
      responseType: 'json',
    }),
  ],

  descriptor: (testingBuilder: TestingModuleBuilder) => {
    let httpService: HttpService;

    beforeAll(async () => {
      const testingModule = await testingBuilder.compile();
      httpService = await testingModule.resolve(HttpService);
    });

    describe('request proxy', () => {
      it('should throw a not found exception', async () => {
        let errorStatus: number;

        try {
          await httpService.get('404');
        }
        catch (e) {
          errorStatus = e.status;
        }

        expect(errorStatus).toEqual(HttpStatus.NOT_FOUND);
      });
    });
  },

});

TestModule.createSandbox({
  name: 'HttpService (Utilities)',

  imports: [
    HttpModule.register(),
  ],

  descriptor: (testingBuilder: TestingModuleBuilder) => {
    let httpService: HttpService;

    beforeAll(async () => {
      const testingModule = await testingBuilder.compile();
      httpService = await testingModule.resolve(HttpService);
    });

    describe('parseCookies', () => {
      it('should parse cookies from response headers', async () => {
        const res: HttpResponse<string> = await httpService.get('https://www.google.com');
        expect(res.cookies[0]).toBeDefined();
        expect(res.cookies[0].domain).toMatch(/google/g);
        expect(res.cookies[0].expires).toBeInstanceOf(Date);
      });
    });
  },

});
