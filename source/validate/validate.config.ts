import { ValidationPipeOptions } from '@nestjs/common';

import { ValidateOptions } from './validate.interface';

export const VALIDATE_REQUEST_DEFAULT_OPTIONS: ValidationPipeOptions = {
  whitelist: true,
  forbidNonWhitelisted: true,
  always: true,
  strictGroups: true,
  transformOptions: {
    ignoreDecorators: true,
  },
};

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

export const VALIDATE_DEFAULT_OPTIONS: ValidateOptions = {
  request: VALIDATE_REQUEST_DEFAULT_OPTIONS,
  response: VALIDATE_RESPONSE_DEFAULT_OPTIONS,
};
