import { Request } from 'express';

export interface AppRequest extends Request {
  headers: { [key: string]: string };
  metadata: AppRequestMetadata;
}

export interface AppRequestMetadata extends Record<string, any> {
  clientIp?: string;
  userAgent?: string;
  jwtPayload?: any;
}
