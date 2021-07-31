import { HttpException, HttpStatus } from '@nestjs/common';

export interface AppException {
  exception: HttpException | Error;
  errorCode: HttpStatus;
  message: string;
  details: AppExceptionDetails;
}

export interface AppExceptionDetails extends Record<string, any> {
  proxyExceptions?: boolean;
  externalResponse?: Record<string, any>;
  externalRequest?: Record<string, any>;
  constraints?: string[];
}

export interface AppExceptionResponse extends Record<string, any> {
  code: number;
  message: string;
}
