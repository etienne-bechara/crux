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
  public async use(req: AppRequest, res: AppResponse, next: any): Promise<void> {
    await this.addRequestMetadata(req);
    next();
  }

  /**
   * Adds a metadata object on all request for easy access
   * to user ip, agent and jwt payload.
   * @param req
   */
  public async addRequestMetadata(req: AppRequest): Promise<void> {
    req.metadata = {
      clientIp: this.utilService.getClientIp(req),
      serverIp: await this.utilService.getServerIp(),
      userAgent: req.headers ? req.headers['user-agent'] : null,
      jwtPayload: req.headers?.authorization
        ? jwt.decode(req.headers.authorization.replace('Bearer ', '')) || { }
        : { },
    };
  }

}
