/* eslint-disable @typescript-eslint/naming-convention */
import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber as CvIsNumber, IsNumberOptions, IsOptional as CvIsOptional, IsString as CvIsString, ValidationOptions } from 'class-validator';

/**
 * Checks if value is missing and if so, ignores all validators.
 * @param validationOptions
 */
export function IsOptional(validationOptions?: ValidationOptions): PropertyDecorator {
  return applyDecorators(
    CvIsOptional(validationOptions),
    ApiProperty({ required: false }),
  );
}

/**
 * Checks if a value is a number.
 * @param options
 * @param validationOptions
 */
export function IsNumber(options: IsNumberOptions = { }, validationOptions?: ValidationOptions): PropertyDecorator {
  return applyDecorators(
    CvIsNumber(options, validationOptions),
    ApiProperty(),
  );
}

/**
 * Checks if a given value is a real string.
 * @param validationOptions
 */
export function IsString(validationOptions?: ValidationOptions): PropertyDecorator {
  return applyDecorators(
    CvIsString(validationOptions),
    ApiProperty(),
  );
}
