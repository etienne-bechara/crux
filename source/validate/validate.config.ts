import { ValidationPipeOptions } from '@nestjs/common';

import { ValidateOptions } from './validate.interface';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const VALIDATE_REQUEST_DEFAULT_OPTIONS: ValidationPipeOptions = {
  whitelist: true,
  forbidNonWhitelisted: true,
  always: true,
  strictGroups: true,
  transformOptions: {
    ignoreDecorators: true,
  },
};

// eslint-disable-next-line @typescript-eslint/naming-convention
export const VALIDATE_RESPONSE_DEFAULT_OPTIONS: ValidationPipeOptions = {
  whitelist: true,
  forbidNonWhitelisted: true,
  skipNullProperties: true,
  validationError: {
    target: false,
  },
  transformOptions: {
    excludeExtraneousValues: true,
  },
};

// eslint-disable-next-line @typescript-eslint/naming-convention
export const VALIDATE_DEFAULT_OPTIONS: ValidateOptions = {
  request: VALIDATE_REQUEST_DEFAULT_OPTIONS,
  response: VALIDATE_RESPONSE_DEFAULT_OPTIONS,
};
