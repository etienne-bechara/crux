import { ValidationPipeOptions } from '@nestjs/common';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const VALIDATOR_DEFAULT_OPTIONS: ValidationPipeOptions = {
  whitelist: true,
  forbidNonWhitelisted: true,
  always: true,
  strictGroups: true,
  transformOptions: {
    ignoreDecorators: true,
  },
};
