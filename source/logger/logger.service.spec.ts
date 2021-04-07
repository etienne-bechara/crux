import { TestingModuleBuilder } from '@nestjs/testing';

import { TestModule } from '../test';
import { LoggerModule } from './logger.module';
import { LoggerService } from './logger.service';

TestModule.createSandbox({
  name: 'LoggerService',
  imports: [ LoggerModule ],

  descriptor: (testingBuilder: TestingModuleBuilder) => {
    let loggerService: LoggerService;

    beforeAll(async () => {
      const testingModule = await testingBuilder.compile();
      loggerService = testingModule.get(LoggerService);
    });

    describe('sanitize', () => {
      it('should delete sensitive keys from object', () => {
        const sensitiveObject = {
          string: 'abc',
          number: 123,
          headers: {
            authorization: 'Bearer eyj....s3h',
            key: undefined,
          },
          auth: {
            nonce: '8b0cbc6b-7596-4e2b-b7d1-572a466fcf26',
            user: 'admin',
            pass: '1234',
          },
          mfa: [
            {
              user: 'john.doe',
              password: '1234',
            },
            {
              user: undefined,
              password: undefined,
            },
          ],
        };

        const censoredObject = loggerService.sanitize(sensitiveObject);

        expect(censoredObject).toMatchObject({
          string: 'abc',
          number: 123,
          headers: {
            authorization: '[filtered]',
          },
          auth: {
            nonce: '[filtered]',
            user: 'admin',
            pass: '[filtered]',
          },
          mfa: [
            {
              user: 'john.doe',
              password: '[filtered]',
            },
            { },
          ],
        });
      });
    });
  },
});
