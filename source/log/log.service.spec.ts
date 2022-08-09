/* eslint-disable @typescript-eslint/naming-convention */
import { AppModule } from '../app/app.module';
import { LogService } from './log.service';

describe('LogService', () => {
  let logService: LogService;

  beforeAll(async () => {
    const app = await AppModule.compile({ disableAll: true });
    logService = app.get(LogService);
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
        authorization: {
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

      const censoredObject = logService.sanitize(sensitiveObject);

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
        authorization: '[filtered]',
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
