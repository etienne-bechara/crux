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

    describe('filterSensitiveData', () => {
      it('should delete sensitive keys from object', () => {
        const sensitiveObject = {
          notSensitive: 'hello world',
          password: '1234',
          authorization: 'Bearer eyj1f0h9j0982ef',
        };

        const censoredObject = loggerService.filterSensitiveData(sensitiveObject);
        expect(censoredObject).toMatchObject({
          notSensitive: 'hello world',
          password: '[filtered]',
          authorization: '[filtered]',
        });
      });
    });
  },
});
