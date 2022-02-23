/* eslint-disable @typescript-eslint/naming-convention */
import { AppModule } from '../app/app.module';
import { LoggerService } from './logger.service';

describe('LoggerService', () => {
  let loggerService: LoggerService;

  beforeAll(async () => {
    const app = await AppModule.compile({ disableModuleScan: true, disableLogger: true });
    loggerService = app.get(LoggerService);
  });

  describe('sanitize', () => {
    it('should delete sensitive keys from object', () => {
      const sensitiveObject = {
        string: 'abc',
        number: 123,
        headers: {
          authorization: 'Bearer eyj....s3h',
          empty: undefined,
        },
        auth: {
          nonce: '8b0cbc6b-7596-4e2b-b7d1-572a466fcf26',
          user: 'admin',
          pass: '1234',
        },
        body: {
          _key: 'hbuF&^%fdsa4tf',
          clientSecret: 'MAF...S4D',
          data: 123,
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
          nonce: '8b0cbc6b-7596-4e2b-b7d1-572a466fcf26',
          user: 'admin',
          pass: '[filtered]',
        },
        body: {
          _key: '[filtered]',
          clientSecret: '[filtered]',
          data: 123,
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
});
