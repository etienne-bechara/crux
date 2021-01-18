import { HttpException, HttpStatus } from '@nestjs/common';

export interface AppException {
  exception: HttpException | Error;
  errorCode: HttpStatus;
  message: string;
  details: Record<string, any>;
}
