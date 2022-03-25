/* eslint-disable simple-import-sort/exports */
export * from '@nestjs/common';
export * from '@nestjs/core';
export * from '@nestjs/platform-fastify';
export * from '@nestjs/swagger';
export * from 'class-transformer';
export * from 'class-validator';
export * from 'rxjs';

export { HttpAdapterHost, ValidationError, Type } from '@nestjs/common';
export { v1 as uuidV1, v3 as uuidV3, v4 as uuidV4, v5 as uuidV5 } from 'uuid';

export { Type as SetType } from 'class-transformer';
export { isEmpty, min, max } from 'class-validator';

export { Controller, Get, Post, Put, Patch, Delete, Head, Options } from '../app/app.decorator';
export { HttpModuleOptions } from '../http/http.interface';
export { HttpModule } from '../http/http.module';
export { HttpService } from '../http/http.service';
export { LogService as LoggerService } from '../log/log.service';

export {
  Contains,
  Equals,
  IsArray,
  IsBoolean,
  IsDate,
  IsDefined,
  IsEmail,
  IsEmpty,
  IsEnum,
  IsIn,
  IsInt,
  IsISO8601,
  IsJSON,
  IsJWT,
  IsNotEmpty,
  IsNotIn,
  IsNumber,
  IsNumberString,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Length,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  NotContains,
  NotEquals,
  ValidateIf,
  ValidateNested,
} from '../validate/validate.decorator';
