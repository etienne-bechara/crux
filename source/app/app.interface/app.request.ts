import { Request } from 'express';

export interface AppRequest extends Request {
  headers: { [key: string]: string };
  metadata: AppRequestMetadata;
}

export interface AppRequestMetadata {
  clientIp?: string;
  userAgent?: string;
  jwtPayload?: any;
}
