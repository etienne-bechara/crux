import { HttpException, HttpStatus } from '@nestjs/common';

export interface AppException {
  exception: HttpException | Error;
  errorCode: HttpStatus;
  message: string;
  details: Record<string, any>;
}

export interface AppExceptionDetails extends Record<string, any> {
  proxyResponse?: boolean;
  upstreamResponse?: Record<string, any>;
  upstreamRequest?: Record<string, any>;
  constraints?: string[];
}
