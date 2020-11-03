
import { HttpStatus } from '@nestjs/common';
import { TestingModuleBuilder } from '@nestjs/testing';

import { TestModule } from '../test';
import { HttpsModule } from './https.module';
import { HttpsService } from './https.service';

const mockService = 'https://jsonplaceholder.typicode.com';

TestModule.createSandbox({
  name: 'HttpsService',

  imports: [
    HttpsModule.register({
      bases: {
        url: mockService,
      },
    }),
  ],

  descriptor: (testingBuilder: TestingModuleBuilder) => {
    let httpsService: HttpsService;

    beforeAll(async () => {
      const testingModule = await testingBuilder.compile();
      httpsService = await testingModule.resolve(HttpsService);
    });

    describe('get', () => {
      it('should read a placeholder resource', async () => {
        const mockPost = {
          userId: 1,
          id: 1,
          title: 'sunt aut facere repellat provident occaecati excepturi optio reprehenderit',
        };
        const data = await httpsService.get('/posts/:postId', {
          replacements: { postId: 1 },
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
        const data = await httpsService.post('/posts', { json: mockPost });
        expect(data).toMatchObject(mockPost);
      });
    });

    describe('delete', () => {
      it('should remove a placeholder resource', async () => {
        const data = await httpsService.delete('/posts/:postId', {
          replacements: { postId: 1 },
        });
        expect(Object.keys(data).length).toBe(0);
      });
    });

    describe('request', () => {
      it('should throw a timeout exception', async () => {
        let errorMessage: string;

        try {
          await httpsService.get('/posts', { timeout: 1 });
        }
        catch (e) {
          errorMessage = e.message;
        }

        expect(errorMessage).toMatch(/timed out/gi);
      });

      it('should throw an internal server error exception', async () => {
        let errorStatus: number;

        try {
          await httpsService.get('/404');
        }
        catch (e) {
          errorStatus = e.status;
        }

        expect(errorStatus).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
      });
    });
  },

});
