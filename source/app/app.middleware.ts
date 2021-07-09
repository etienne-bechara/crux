import { Injectable, NestMiddleware } from '@nestjs/common';

import { UtilService } from '../util/util.service';
import { AppRequest, AppResponse } from './app.interface';

@Injectable()
export class AppMiddleware implements NestMiddleware {

  public constructor(
    private readonly utilService: UtilService,
  ) { }

  /**
   * Applies a global middleware that act upon every
   * request before anything else.
   * @param req
   * @param res
   * @param next
   */
  public use(req: AppRequest, res: AppResponse, next: any): void {
    this.addRequestMetadata(req);
    next();
  }

  /**
   * Adds a metadata object on all request for easy access
   * to user ip, agent and jwt payload.
   * @param req
   */
  private addRequestMetadata(req: AppRequest): void {
    req.metadata = {
      clientIp: this.utilService.getClientIp(req),
      userAgent: req.headers ? req.headers['user-agent'] : null,
      jwtPayload: this.decodeJwt(req.headers?.authorization),
    };
  }

  /**
   * If authorization string contains a JWT decodes it and add to header.
   * @param authorization
   */
  private decodeJwt(authorization: string): Record<string, any> {
    const payload = authorization?.split('.')?.[1];
    if (!payload) return { };

    try {
      const decoded = JSON.parse(Buffer.from(payload, 'base64').toString('utf8'));
      this.flattenJwtMetadata(decoded);
      return decoded;
    }
    catch {
      return { };
    }
  }

  /**
   * Given a decoded JWT payload, flatten its OIDC conformant metadata claims.
   * @param payload
   */
  private flattenJwtMetadata(payload: Record<string, any>): void {
    if (!payload) return;

    const appMetadataKey = Object.keys(payload).find((k) => k.includes('/app_metadata'));
    const userMetadataKey = Object.keys(payload).find((k) => k.includes('/user_metadata'));

    if (appMetadataKey) payload.app_metadata = payload[appMetadataKey];
    if (userMetadataKey) payload.user_metadata = payload[userMetadataKey];
  }

}
