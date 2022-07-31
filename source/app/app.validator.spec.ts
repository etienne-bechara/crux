/* eslint-disable max-len */
/* eslint-disable jsdoc/require-jsdoc */
import { Body, HttpStatus, INestApplication, Module } from '@nestjs/common';
import supertest from 'supertest';

import { Controller, Post } from './app.decorator';
import { AppModule } from './app.module';
import { IsBoolean, IsNumber, IsObject, IsOptional, IsString } from './app.override';

class ValidatorNestedDto {

  @IsBoolean()
  public requiredBoolean: boolean;

  @IsOptional()
  @IsNumber()
  public optionalNumber: number;

}

class ValidatorCreateDto {

  @IsString()
  public requiredString: string;

  @IsNumber()
  public requiredNumber: number;

  @IsOptional()
  @IsString()
  public optionalString: string;

  @IsObject(ValidatorNestedDto)
  public requiredNested: ValidatorNestedDto;

}

@Controller('validator')
class ValidatorController {

  @Post()
  public postValidator(@Body() body: ValidatorCreateDto): ValidatorCreateDto {
    return body;
  }

}

@Module({
  controllers: [
    ValidatorController,
  ],
})
class ValidatorModule { }

describe('AppValidator', () => {
  let app: INestApplication;
  let httpServer: any;

  beforeAll(async () => {
    app = await AppModule.boot({
      disableScan: true,
      disableLogs: true,
      port: 0,
      imports: [ ValidatorModule ],
    });

    httpServer = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /validator', () => {
    it('[201] all properties', async () => {
      const { statusCode } = await supertest(httpServer).post('/validator').send({
        requiredString: 'set',
        requiredNumber: 1,
        optionalString: 'set',
        requiredNested: {
          requiredBoolean: true,
          optionalNumber: 1,
        },
      });

      expect(statusCode).toBe(HttpStatus.CREATED);
    });

    it('[201] required properties', async () => {
      const { statusCode } = await supertest(httpServer).post('/validator').send({
        requiredString: 'set',
        requiredNumber: 1,
        requiredNested: {
          requiredBoolean: true,
        },
      });

      expect(statusCode).toBe(HttpStatus.CREATED);
    });

    it('[400] additional property', async () => {
      const { statusCode, body } = await supertest(httpServer).post('/validator').send({
        requiredString: 'set',
        requiredNumber: 1,
        requiredNested: {
          requiredBoolean: true,
          additionalProperty: 1,
        },
      });

      expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(body.constraints).toStrictEqual([ 'requiredNested.property additionalProperty should not exist' ]);
    });

    it('[400] missing property', async () => {
      const { statusCode, body } = await supertest(httpServer).post('/validator').send({
        requiredString: 'set',
        requiredNested: {
          requiredBoolean: true,
        },
      });

      expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(body.constraints).toStrictEqual([ 'requiredNumber must be a number conforming to the specified constraints' ]);
    });

    it('[400] missing nested property', async () => {
      const { statusCode, body } = await supertest(httpServer).post('/validator').send({
        requiredString: 'set',
        requiredNumber: 1,
        requiredNested: { },
      });

      expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(body.constraints).toStrictEqual([ 'requiredNested.requiredBoolean must be a boolean value' ]);
    });
  });
});
