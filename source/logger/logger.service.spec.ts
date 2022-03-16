/* eslint-disable @typescript-eslint/naming-convention */
import { AppModule } from '../app/app.module';
import { LoggerService } from './logger.service';

describe('LoggerService', () => {
  let loggerService: LoggerService;

  beforeAll(async () => {
    const app = await AppModule.compile({ disableAll: true });
    loggerService = app.get(LoggerService);
  });

  describe('sanitize', () => {
    it('should delete sensitive keys from object', () => {
      const sensitiveObject = {
        string: 'admin',
        number: 1234,
        empty: null,
        undefined: undefined,
        zero: 0,
        username: 'admin',
        password: 'admin',
        headers: {
          authorization: 'Bearer eyj....s3h',
          'content-type': 'application/json',
        },
        auth: {
          nonce: '8b0cbc6b-7596-4e2b-b7d1-572a466fcf26',
          user: 'admin',
          pass: 'admin',
        },
        body: {
          apiKey: 'hbuF&^%fdsa4tf',
          nested: {
            clientSecret: 'MAF...S4D',
          },
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
        data: Buffer.from('test data'),
      };

      const censoredObject = loggerService.sanitize(sensitiveObject);

      expect(censoredObject).toMatchObject({
        string: 'admin',
        number: 1234,
        empty: null,
        zero: 0,
        username: 'admin',
        password: '[filtered]',
        headers: {
          authorization: '[filtered]',
          'content-type': 'application/json',
        },
        auth: '[filtered]',
        body: {
          apiKey: '[filtered]',
          nested: {
            clientSecret: '[filtered]',
          },
        },
        mfa: [
          {
            user: 'john.doe',
            password: '[filtered]',
          },
          { },
        ],
        data: '<Buffer>',
      });
    });
  });
});
