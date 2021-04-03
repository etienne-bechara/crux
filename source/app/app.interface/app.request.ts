import { Request } from 'express';

export interface AppRequest extends Request {
  headers: Record<string, string>;
  metadata: AppRequestMetadata;
}

export interface AppRequestMetadata extends Record<string, any> {
  clientIp?: string;
  userAgent?: string;
  jwtPayload?: any;
}
