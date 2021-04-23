/* eslint-disable jest/no-commented-out-tests */
import { HttpStatus } from '@nestjs/common';
import { TestingModuleBuilder } from '@nestjs/testing';

import { TestModule } from '../test';
import { HttpReturnType } from './http.enum';
import { HttpResponse } from './http.interface';
import { HttpModule } from './http.module';
import { HttpService } from './http.service';

const mockService = 'https://jsonplaceholder.typicode.com';

TestModule.createSandbox({
  name: 'HttpService',

  imports: [
    HttpModule.register({
      bases: {
        url: mockService,
      },
    }),
  ],

  descriptor: (testingBuilder: TestingModuleBuilder) => {
    let httpService: HttpService;

    beforeAll(async () => {
      const testingModule = await testingBuilder.compile();
      httpService = await testingModule.resolve(HttpService);
    });

    // describe('get', () => {
    //   it('should read a placeholder resource', async () => {
    //     const mockPost = {
    //       userId: 1,
    //       id: 1,
    //       title: 'sunt aut facere repellat provident occaecati excepturi optio reprehenderit',
    //     };
    //     const data = await httpService.get('/posts/:postId', {
    //       replacements: { postId: '1' },
    //     });
    //     expect(data).toMatchObject(mockPost);
    //   });
    // });

    // describe('post', () => {
    //   it('should create a placeholder resource', async () => {
    //     const mockPost = {
    //       title: 'foo',
    //       body: 'bar',
    //       userId: 1,
    //     };
    //     const data = await httpService.post('/posts', { json: mockPost });
    //     expect(data).toMatchObject(mockPost);
    //   });
    // });

    // describe('delete', () => {
    //   it('should remove a placeholder resource', async () => {
    //     const data = await httpService.delete('/posts/:postId', {
    //       replacements: { postId: '1' },
    //     });
    //     expect(Object.keys(data).length).toBe(0);
    //   });
    // });

    describe('request', () => {
      it('should throw a timeout exception', async () => {
        let errorMessage: string;

        try {
          await httpService.get('/posts', { timeout: 1 });
        }
        catch (e) {
          errorMessage = e.message;
        }

        expect(errorMessage).toMatch(/timed out/gi);
      });

      it('should throw an internal server error exception', async () => {
        let errorStatus: number;

        try {
          await httpService.get('/404');
        }
        catch (e) {
          errorStatus = e.status;
        }

        expect(errorStatus).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
      });

      // it('should throw a not found exception', async () => {
      //   let errorStatus: number;

      //   try {
      //     await httpService.get('/404', {
      //       exceptionHandler: HttpPredefinedHandler.PROXY_HTTP_STATUS,
      //     });
      //   }
      //   catch (e) {
      //     errorStatus = e.status;
      //   }

      //   expect(errorStatus).toEqual(HttpStatus.NOT_FOUND);
      // });
    });

    describe('parseResponseCookies', () => {
      it('should parse a response cookie', async () => {
        const res: HttpResponse = await httpService.get('https://www.google.com', {
          returnType: HttpReturnType.FULL_RESPONSE,
        });
        expect(res.cookies[0]).toBeDefined();
        expect(res.cookies[0].domain).toMatch(/google/g);
        expect(res.cookies[0].expires).toMatch(/\d{4}-\d{2}-\d{2}/g);
      });
    });
  },

});
