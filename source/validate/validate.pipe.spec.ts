import {
	Body,
	CallHandler,
	Controller,
	ExecutionContext,
	HttpStatus,
	Injectable,
	Module,
	NestInterceptor,
	ParseArrayPipe,
	Post,
	Put,
	UseInterceptors,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import supertest from 'supertest';

import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from '../app/app.module';
import { ContextService } from '../context/context.service';
import { ToNumber } from '../transform/transform.decorator';
import { VALIDATE_REQUEST_DEFAULT_OPTIONS } from './validate.config';
import { IsBoolean, IsNumber, IsObject, IsOptional, IsString } from './validate.decorator';

class ValidatorNestedDto {
	@IsBoolean()
	public requiredBoolean!: boolean;

	@IsOptional()
	@IsNumber()
	public optionalNumber?: number;
}

class ValidatorCreateDto {
	@IsString()
	public requiredString!: string;

	@IsNumber()
	@ToNumber()
	public requiredNumber!: number;

	@IsOptional()
	@IsString()
	public optionalString?: string;

	@IsString({}, { groups: ['group1'] })
	public contextualString!: string;

	@IsObject(ValidatorNestedDto)
	public requiredNested!: ValidatorNestedDto;
}

@Injectable()
class ValidatorInterceptor implements NestInterceptor {
	public constructor(private readonly contextService: ContextService) {}

	public intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> {
		this.contextService.setValidatorOptions({
			...VALIDATE_REQUEST_DEFAULT_OPTIONS,
			groups: ['group1'],
		});

		return next.handle();
	}
}

@Controller('validator')
class ValidatorController {
	@Post()
	public postValidator(@Body() body: ValidatorCreateDto): ValidatorCreateDto {
		return body;
	}

	@Put()
	@UseInterceptors(ValidatorInterceptor)
	public putValidator(@Body() body: ValidatorCreateDto): ValidatorCreateDto {
		return body;
	}

	@Post('any')
	public postValidatorAny(@Body() body: any): any {
		return body;
	}

	@Post('bulk')
	public postValidatorBulk(
		@Body(new ParseArrayPipe({ items: ValidatorCreateDto, strictGroups: true }))
		body: ValidatorCreateDto[],
	): ValidatorCreateDto[] {
		return body;
	}
}

@Module({
	controllers: [ValidatorController],
})
class ValidatorModule {}

describe('AppValidator', () => {
	let app: NestFastifyApplication;
	let httpServer: any;

	beforeAll(async () => {
		app = await AppModule.boot({
			disableScan: true,
			disableLogs: true,
			disableMetrics: true,
			disableTraces: true,
			port: 0,
			imports: [ValidatorModule],
		});

		httpServer = app.getHttpServer();
	});

	afterAll(async () => {
		await app.close();
	});

	describe('POST /validator', () => {
		it('[201] all properties', async () => {
			const data = {
				requiredString: 'set',
				requiredNumber: 1,
				optionalString: 'set',
				requiredNested: {
					requiredBoolean: true,
					optionalNumber: 1,
				},
			};

			const { statusCode, body } = await supertest(httpServer).post('/validator').send(data);

			expect(statusCode).toBe(HttpStatus.CREATED);
			expect(body).toStrictEqual(data);
		});

		it('[201] required properties and transformation', async () => {
			const data = {
				requiredString: 'set',
				requiredNumber: '1',
				requiredNested: {
					requiredBoolean: true,
				},
			};

			const { statusCode, body } = await supertest(httpServer).post('/validator').send(data);

			expect(statusCode).toBe(HttpStatus.CREATED);
			expect(body).toStrictEqual({ ...data, requiredNumber: 1 });
		});

		it('[400] missing body', async () => {
			const { statusCode, body } = await supertest(httpServer).post('/validator').send();

			expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
			expect(body.constraints).toStrictEqual([
				'requiredString must be a string',
				'requiredString should not be empty',
				'requiredNumber must be a number conforming to the specified constraints',
				'requiredNested must be an object',
			]);
		});

		it('[400] primitive body', async () => {
			const { statusCode, body } = await supertest(httpServer).post('/validator').send('string');

			expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
			expect(body.constraints).toStrictEqual([
				'property string should not exist',
				'requiredString must be a string',
				'requiredString should not be empty',
				'requiredNumber must be a number conforming to the specified constraints',
				'requiredNested must be an object',
			]);
		});

		it('[400] additional property', async () => {
			const { statusCode, body } = await supertest(httpServer)
				.post('/validator')
				.send({
					requiredString: 'set',
					requiredNumber: 1,
					requiredNested: {
						requiredBoolean: true,
						additionalProperty: 1,
					},
				});

			expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
			expect(body.constraints).toStrictEqual(['requiredNested.property additionalProperty should not exist']);
		});

		it('[400] missing property', async () => {
			const { statusCode, body } = await supertest(httpServer)
				.post('/validator')
				.send({
					requiredString: 'set',
					requiredNested: {
						requiredBoolean: true,
					},
				});

			expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
			expect(body.constraints).toStrictEqual([
				'requiredNumber must be a number conforming to the specified constraints',
			]);
		});

		it('[400] missing nested property', async () => {
			const { statusCode, body } = await supertest(httpServer).post('/validator').send({
				requiredString: 'set',
				requiredNumber: 1,
				requiredNested: {},
			});

			expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
			expect(body.constraints).toStrictEqual(['requiredNested.requiredBoolean must be a boolean value']);
		});
	});

	describe('PUT /validator', () => {
		it('[200] required properties', async () => {
			const data = {
				requiredString: 'set',
				requiredNumber: 1,
				contextualString: 'set',
				requiredNested: {
					requiredBoolean: true,
				},
			};

			const { statusCode, body } = await supertest(httpServer).put('/validator').send(data);

			expect(statusCode).toBe(HttpStatus.OK);
			expect(body).toStrictEqual(data);
		});

		it('[400] missing requiredString', async () => {
			const { statusCode, body } = await supertest(httpServer)
				.put('/validator')
				.send({
					requiredNumber: 1,
					contextualString: 'set',
					requiredNested: {
						requiredBoolean: true,
					},
				});

			expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
			expect(body.constraints).toStrictEqual(['requiredString must be a string', 'requiredString should not be empty']);
		});

		it('[400] missing contextualString', async () => {
			const { statusCode, body } = await supertest(httpServer)
				.put('/validator')
				.send({
					requiredString: 'set',
					requiredNumber: 1,
					requiredNested: {
						requiredBoolean: true,
					},
				});

			expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
			expect(body.constraints).toStrictEqual([
				'contextualString must be a string',
				'contextualString should not be empty',
			]);
		});
	});

	describe('POST /validator/any', () => {
		it('[201] allow anything', async () => {
			const data = {
				anyString: 'set',
				anyNumber: 1,
				anyNested: {
					anyBoolean: true,
				},
			};

			const { statusCode, body } = await supertest(httpServer).post('/validator/any').send(data);

			expect(statusCode).toBe(HttpStatus.CREATED);
			expect(body).toStrictEqual(data);
		});
	});

	describe('POST /validator/bulk', () => {
		it('[201] two array items with all properties', async () => {
			const data = [
				{
					requiredString: 'set',
					requiredNumber: 1,
					optionalString: 'set',
					requiredNested: {
						requiredBoolean: true,
						optionalNumber: 1,
					},
				},
				{
					requiredString: 'ok',
					requiredNumber: 2,
					optionalString: 'ok',
					requiredNested: {
						requiredBoolean: false,
						optionalNumber: 2,
					},
				},
			];

			const { statusCode, body } = await supertest(httpServer).post('/validator/bulk').send(data);

			expect(statusCode).toBe(HttpStatus.CREATED);
			expect(body).toStrictEqual(data);
		});

		it('[400] two array items, missing requiredString on second', async () => {
			const data = [
				{
					requiredString: 'set',
					requiredNumber: 1,
					requiredNested: {
						requiredBoolean: true,
					},
				},
				{
					requiredNumber: 2,
					requiredNested: {
						requiredBoolean: false,
					},
				},
			];

			const { statusCode, body } = await supertest(httpServer).post('/validator/bulk').send(data);

			expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
			expect(body.constraints).toStrictEqual(['requiredString must be a string', 'requiredString should not be empty']);
		});
	});
});
