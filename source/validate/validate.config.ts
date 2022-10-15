import { ValidatorOptions } from 'class-validator';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const VALIDATOR_DEFAULT_OPTIONS: ValidatorOptions = {
  whitelist: true,
  forbidNonWhitelisted: true,
  always: true,
  strictGroups: true,
};
