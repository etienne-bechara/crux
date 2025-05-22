import crypto from 'node:crypto';
import { setTimeout } from 'node:timers/promises';

import { LogService } from '../../source/log/log.service';
import {
	BadRequestException,
	ForbiddenException,
	GatewayTimeoutException,
	HttpException,
	HttpService,
	HttpStatus,
	Injectable,
	InternalServerErrorException,
	UnauthorizedException,
} from '../../source/override';

@Injectable()
export class RandomService {
	public constructor(
		private readonly httpService: HttpService,
		private readonly logService: LogService,
	) {}

	/**
	 * Do multiple random calls through parallel http.
	 * @param amount
	 */
	public async doRandomSplit(amount: number): Promise<any> {
		const promises = [];

		for (let i = 0; i < amount; i++) {
			promises.push(this.httpService.get('http://localhost:8080/random'));
		}

		return Promise.allSettled(promises);
	}

	/**
	 * Does something completely random for debugging purposes.
	 */
	public async doRandom(): Promise<any> {
		const metadata = { random: crypto.randomBytes(7).toString('hex') };
		const inLatency = Math.random() * 1000;
		const outLatency = Math.random() * 1000;
		const dice = Math.random() * 100;

		await setTimeout(inLatency);

		switch (true) {
			case dice > 95: {
				throw new GatewayTimeoutException({ message: 'failed to fulfill request within timeout', ...metadata });
			}

			case dice > 90: {
				throw new InternalServerErrorException({ message: 'something went wrong', ...metadata });
			}

			case dice > 85: {
				throw new HttpException({ message: 'too many requests', ...metadata }, HttpStatus.TOO_MANY_REQUESTS);
			}

			case dice > 80: {
				throw new ForbiddenException({ message: 'not enough privileges', ...metadata });
			}

			case dice > 75: {
				throw new UnauthorizedException({ message: 'missing authorization header', ...metadata });
			}

			case dice > 70: {
				throw new BadRequestException('date must be an ISO8601 string');
			}

			case dice > 65: {
				throw new Error('unexpected error');
			}

			case dice > 60: {
				const divisionByZero = dice / 0;
				return divisionByZero;
			}

			case dice > 55: {
				const propertyAccess = 'x'['y' as any]['z' as any];
				return propertyAccess;
			}

			case dice > 50: {
				const google = await this.httpService.get('https://www.google.com');

				await setTimeout(outLatency);
				return google;
			}

			case dice > 45: {
				const notFound = await this.httpService.get('https://www.google.com/404', {
					retryCodes: [404],
				});

				return notFound;
			}

			case dice > 40: {
				this.logService.fatal('Catasthrophic failure', metadata);
				await setTimeout(outLatency);
				return metadata;
			}

			case dice > 35: {
				this.logService.error('Failed to do something', metadata);
				await setTimeout(outLatency);
				return metadata;
			}

			case dice > 30: {
				this.logService.warning('Something bad is about to happen', metadata);
				await setTimeout(outLatency);
				return metadata;
			}

			case dice > 25: {
				this.logService.notice('Random stuff done successfully', metadata);
				await setTimeout(outLatency);
				return metadata;
			}

			case dice > 20: {
				this.logService.info('Doing random stuff', metadata);
				await setTimeout(outLatency);
				return metadata;
			}

			case dice > 15: {
				this.logService.debug('Detailing random stuff being done', metadata);
				await setTimeout(outLatency);
				return metadata;
			}

			case dice > 10: {
				this.logService.trace('Detailing random stuff being done even more', metadata);
				await setTimeout(outLatency);
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
				await setTimeout(outLatency);
				return metadata;
			}

			default: {
				return metadata;
			}
		}
	}
}
