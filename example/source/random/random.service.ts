import crypto from 'crypto';

import { BadRequestException, ForbiddenException, GatewayTimeoutException, HttpException, HttpService, HttpStatus, Injectable, InternalServerErrorException, UnauthorizedException } from '../../../source/app/app.override';
import { LogService } from '../../../source/log/log.service';
import { PromiseService } from '../../../source/promise/promise.service';

@Injectable()
export class RandomService {

  public constructor(
    private readonly promiseService: PromiseService,
    private readonly httpService: HttpService,
    private readonly logService: LogService,
  ) { }

  /**
   * Does something completely random for debugging purposes.
   */
  // eslint-disable-next-line complexity
  public async doRandom(): Promise<any> {
    const inLatency = Math.random() * 1000;
    const outLatency = Math.random() * 1000;
    await this.promiseService.sleep(inLatency);

    const dice = Math.random() * 100;
    const metadata = { latency: inLatency, dice, crypt: crypto.randomBytes(7).toString('hex') };

    switch (true) {
      case dice > 95:
        throw new GatewayTimeoutException({ message: 'failed to fulfill request within timeout', ...metadata });

      case dice > 90:
        throw new InternalServerErrorException({ message: 'something went wrong', ...metadata });

      case dice > 85:
        throw new HttpException({ message: 'too many requests', ...metadata }, HttpStatus.TOO_MANY_REQUESTS);

      case dice > 80:
        throw new ForbiddenException({ message: 'not enough privileges', ...metadata });

      case dice > 75:
        throw new UnauthorizedException({ message: 'missing authorization header', ...metadata });

      case dice > 70:
        throw new BadRequestException('date must be an ISO8601 string');

      case dice > 65:
        throw new Error('unexpected error');

      case dice > 60: {
        const divisionByZero = dice / 0;
        return divisionByZero;
      }

      case dice > 55: {
        const propertyAccess = 'x'['y']['z'];
        return propertyAccess;
      }

      case dice > 50: {
        const google = await this.httpService.get('https://www.google.com', {
          responseType: 'text',
        });

        await this.promiseService.sleep(outLatency);
        return google;
      }

      case dice > 45: {
        const post = await this.httpService.get('https://jsonplaceholder.typicode.com/posts/:id', {
          replacements: { id: Math.floor(Math.random() * 100).toString() },
          responseType: 'json',
        });

        await this.promiseService.sleep(outLatency);
        return post;
      }

      case dice > 40: {
        this.logService.fatal('Catasthrophic failure', metadata);
        await this.promiseService.sleep(outLatency);
        return metadata;
      }

      case dice > 35: {
        this.logService.error('Failed to do something', metadata);
        await this.promiseService.sleep(outLatency);
        return metadata;
      }

      case dice > 30: {
        this.logService.warning('Something bad is about to happen', metadata);
        await this.promiseService.sleep(outLatency);
        return metadata;
      }

      case dice > 25: {
        this.logService.notice('Random stuff done successfully', metadata);
        await this.promiseService.sleep(outLatency);
        return metadata;
      }

      case dice > 20: {
        this.logService.info('Doing random stuff', metadata);
        await this.promiseService.sleep(outLatency);
        return metadata;
      }

      case dice > 15: {
        this.logService.debug('Detailing random stuff being done', metadata);
        await this.promiseService.sleep(outLatency);
        return metadata;
      }

      case dice > 10: {
        this.logService.trace('Detailing random stuff being done even more', metadata);
        await this.promiseService.sleep(outLatency);
        return metadata;
      }

      case dice > 5: {
        this.logService.fatal(crypto.randomBytes(20).toString('base64url'), metadata);
        this.logService.error(crypto.randomBytes(20).toString('base64url'), metadata);
        this.logService.warning(crypto.randomBytes(20).toString('base64url'), metadata);
        this.logService.notice(crypto.randomBytes(20).toString('base64url'), metadata);
        this.logService.info(crypto.randomBytes(20).toString('base64url'), metadata);
        this.logService.debug(crypto.randomBytes(20).toString('base64url'), metadata);
        this.logService.trace(crypto.randomBytes(20).toString('base64url'), metadata);
        await this.promiseService.sleep(outLatency);
        return metadata;
      }

      default:
        return metadata;
    }
  }

}
