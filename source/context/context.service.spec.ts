import { HttpException, HttpStatus } from '@nestjs/common';

import { AppModule } from '../app/app.module';
import { ContextService } from './context.service';

describe('ContextService', () => {
  let contextService: ContextService;

  beforeAll(async () => {
    const app = await AppModule.compile({ disableModuleScan: true, disableLogger: true });
    contextService = app.get(ContextService);
  });

  describe('decodeJwtPayload', () => {
    it('should decode jwt payload flattening metadata claims', () => {
      // eslint-disable-next-line max-len
      const token = 'xxx.ew0KICAiaXNzIjogImh0dHBzOi8vYmVjaGFyYS5hdXRoMC5jb20vIiwNCiAgInN1YiI6ICJhdXRoMHwxMjMiLA0KICAiYXVkIjogImFiYyIsDQogICJpYXQiOiAxNjM0MTQ4MjAzLA0KICAiZXhwIjogMTYzNDMyODIwMywNCiAgImF0X2hhc2giOiAiZGVmIiwNCiAgIm5vbmNlIjogImdoaSIsDQogICJodHRwczovL2JlY2hhcmEuYWkvYXBwX21ldGFkYXRhIjogew0KICAgICJpZCI6IDEyMw0KICB9LA0KICAiaHR0cHM6Ly9iZWNoYXJhLmFpL3VzZXJfbWV0YWRhdGEiOiB7DQogICAgImlkIjogNDU2DQogIH0NCn0=.xxx';
      const payload = contextService['decodeJwtPayload'](token);

      expect(payload).toStrictEqual({
        'iss': 'https://bechara.auth0.com/',
        'sub': 'auth0|123',
        'aud': 'abc',
        'iat': 1_634_148_203,
        'exp': 1_634_328_203,
        'at_hash': 'def',
        'nonce': 'ghi',
        'https://bechara.ai/app_metadata': {
          'id': 123,
        },
        'https://bechara.ai/user_metadata': {
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
      let err: HttpException;

      try {
        contextService['decodeJwtPayload'](token);
      }
      catch (e) {
        err = e;
      }

      expect(err.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
    });
  });
});
