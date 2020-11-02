import { HttpException } from '@nestjs/common';

export interface AppException {
  exception: HttpException | Error;
  errorCode: number;
  message: string;
  details: Record<string, any>;
}
