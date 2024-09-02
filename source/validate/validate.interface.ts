import { ValidationPipeOptions } from '@nestjs/common';

export interface ValidateOptions {
  /** Validation options for request contracts defined using @Params(), @Body() or @Query() decorators. */
  request?: ValidationPipeOptions;
  /** Validation options for response contracts defined using @Response() decorator at endpoint. */
  response?: ValidationPipeOptions & { throwException?: boolean };
}

export interface IsStringOptions {
  allowEmpty?: boolean;
}
