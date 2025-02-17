/* eslint-disable @typescript-eslint/naming-convention */
import { HttpException, HttpStatus } from '@nestjs/common';

import { AppModule } from '../app/app.module';
import { ContextService } from './context.service';

describe('ContextService', () => {
  let contextService: ContextService;

  beforeAll(async () => {
    const app = await AppModule.compile({ disableAll: true });
    contextService = app.get(ContextService);
  });

  describe('decodeJwtPayload', () => {
    it('should decode jwt payload flattening metadata claims', () => {
      // eslint-disable-next-line max-len
      const token = 'xxx.ew0KICAiaXNzIjogImh0dHBzOi8vbW9jay5hdXRoMC5jb20vIiwNCiAgInN1YiI6ICJhdXRoMHwxMjMiLA0KICAiYXVkIjogImFiYyIsDQogICJpYXQiOiAxNjM0MTQ4MjAzLA0KICAiZXhwIjogMTYzNDMyODIwMywNCiAgImF0X2hhc2giOiAiZGVmIiwNCiAgIm5vbmNlIjogImdoaSIsDQogICJodHRwczovL21vY2suY29tL2FwcF9tZXRhZGF0YSI6IHsNCiAgICAiaWQiOiAxMjMNCiAgfSwNCiAgImh0dHBzOi8vbW9jay5jb20vdXNlcl9tZXRhZGF0YSI6IHsNCiAgICAiaWQiOiA0NTYNCiAgfQ0KfQ==.xxx';
      const payload = contextService['decodeJwtPayload'](token);

      expect(payload).toStrictEqual({
        'iss': 'https://mock.auth0.com/',
        'sub': 'auth0|123',
        'aud': 'abc',
        'iat': 1_634_148_203,
        'exp': 1_634_328_203,
        'at_hash': 'def',
        'nonce': 'ghi',
        'https://mock.com/app_metadata': {
          'id': 123,
        },
        'https://mock.com/user_metadata': {
          'id': 456,
        },
        'app_metadata': {
          'id': 123,
        },
        'user_metadata': {
          'id': 456,
        },
      });
    });

    it('should throw an exception for invalid payload', () => {
      const token = 'xxx.xxx.xxx';
      let err: HttpException | undefined;

      try {
        contextService['decodeJwtPayload'](token);
      }
      catch (e: unknown) {
        err = e as HttpException;
      }

      expect(err?.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
    });
  });
});
