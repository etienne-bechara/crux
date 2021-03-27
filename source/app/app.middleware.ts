import { Injectable, NestMiddleware } from '@nestjs/common';
import jwt from 'jsonwebtoken';

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
    this.flattenJwtMetadata(req);
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
      jwtPayload: req.headers?.authorization
        ? jwt.decode(req.headers.authorization.replace('Bearer ', '')) || { }
        : { },
    };
  }

  /**
   * Given a request with JWT payload already decoded,
   * flatten its OIDC conformant metadata claims.
   * @param req
   */
  private flattenJwtMetadata(req: AppRequest): void {
    const jwtPayload = req?.metadata?.jwtPayload;
    if (!jwtPayload) return;

    const appMetadataKey = Object.keys(jwtPayload).find((k) => k.includes('/app_metadata'));
    const userMetadataKey = Object.keys(jwtPayload).find((k) => k.includes('/user_metadata'));

    if (appMetadataKey) jwtPayload.app_metadata = jwtPayload[appMetadataKey];
    if (userMetadataKey) jwtPayload.user_metadata = jwtPayload[userMetadataKey];
  }

}
