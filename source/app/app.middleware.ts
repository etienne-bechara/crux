import { Injectable, NestMiddleware } from '@nestjs/common';

import { UtilService } from '../util/util.service';
import { AppRawRequest, AppResponse } from './app.interface';

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
  public use(req: AppRawRequest, res: AppResponse, next: any): void {
    this.addRequestMetadata(req);
    next();
  }

  /**
   * Add extra metadata to request objet.
   * @param req
   */
  private addRequestMetadata(req: AppRawRequest): void {
    req.metadata = {
      jwtPayload: this.decodeJwt(req.headers?.authorization),
      remoteIp: this.parseForwardedIp(req),
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

  /**
   * Determines furthest remote ip based on forwarded header .
   * @param req
   */
  private parseForwardedIp(req: AppRawRequest): string {
    const forwardedIpRegex = /by.+?for=(.+?);/g;
    const forwardedHeader = req.headers.forwarded;
    let forwardedIp;

    if (forwardedHeader) {
      forwardedIp = forwardedIpRegex.exec(forwardedHeader);
    }

    return forwardedIp?.[1];
  }

}
