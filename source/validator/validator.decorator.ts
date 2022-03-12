/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/naming-convention */
import { applyDecorators } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger';
import {
  Contains as CvContains,
  Equals as CvEquals,
  IsArray as CvIsArray,
  IsBoolean as CvIsBoolean,
  IsDate as CvIsDate,
  IsDefined as CvIsDefined,
  IsEmail as CvIsEmail,
  IsEmpty as CvIsEmpty,
  IsEnum as CvIsEnum,
  IsIn as CvIsIn,
  IsInt as CvIsInt,
  IsISO8601 as CvIsISO8601,
  IsNotEmpty as CvIsNotEmpty,
  IsNotIn as CvIsNotIn,
  IsNumber as CvIsNumber,
  IsNumberOptions,
  IsNumberString as CvIsNumberString,
  IsObject as CvIsObject,
  IsOptional as CvIsOptional,
  IsString as CvIsString,
  IsUUID as CvIsUUID,
  Length as CvLength,
  Matches as CvMatches,
  Max as CvMax,
  MaxLength as CvMaxLength,
  Min as CvMin,
  MinLength as CvMinLength,
  NotContains as CvNotContains,
  NotEquals as CvNotEquals,
  registerDecorator,
  UUIDVersion,
  ValidateIf as CvValidateIf,
  ValidateNested as CvValidateNested,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

import { ValidatorStorage } from './validator.storage';

/**
 * Builds default ApiProperty options based on class-validator decorator.
 * @param type
 * @param validationOptions
 */
function getPropertyOptions(type: any, validationOptions: ValidationOptions): ApiPropertyOptions {
  const { each } = validationOptions || { };

  return {
    type: each ? [ type ] : type,
  };
}

// -- Custom validation decorators

/**
 * Ensures that exactly one property of target group is defined.
 * @param group
 * @param validationOptions
 */
export function OneOf(group: string, validationOptions?: ValidationOptions): PropertyDecorator {
  const key = `MUTUALLY_EXCLUSIVE_${group}`;
  const propKeys: string[] = ValidatorStorage.get(key) || [ ];
  const currentKeys = [ ...propKeys ];

  return applyDecorators(
    MutuallyExclusive(group, validationOptions),
    currentKeys.length === 0
      ? IsOptional()
      : ValidateIf((o) => currentKeys.filter((k) => o[k] === undefined).length === currentKeys.length),
  );
}

/**
 * Checks if no more than one property of target group is defined.
 * @param group
 * @param validationOptions
 */
export function MutuallyExclusive(group: string, validationOptions?: ValidationOptions): PropertyDecorator {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function (object: Object, propertyName: string): any {
    const key = `MUTUALLY_EXCLUSIVE_${group}`;
    const mutuallyExclusiveProperties: string[] = ValidatorStorage.get(key) || [ ];

    mutuallyExclusiveProperties.push(propertyName);
    ValidatorStorage.set(key, mutuallyExclusiveProperties);

    registerDecorator({
      name: 'MutuallyExclusive',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [ group ],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const propKeys: string[] = ValidatorStorage.get(key);
          const propDefined = propKeys.reduce((p, c) => args.object[c] !== undefined ? ++p : p, 0);
          return propDefined === 1;
        },
        defaultMessage(args?: ValidationArguments) {
          const propKeys: string[] = ValidatorStorage.get(key);
          const propDefined = propKeys.reduce((p, c) => args.object[c] !== undefined ? ++p : p, 0);

          return propDefined === 0
            ? `one of ${propKeys.join(', ')} must be defined`
            : `properties ${propKeys.join(', ')} are mutually exclusive`;
        },
      },
    });
  };
}

// --- Common validation decorators

/**
 * Ignores the other validators on a property when the provided condition function returns false.
 * @param condition
 * @param validationOptions
 */
export function ValidateIf(condition: (object: any, value: any) => boolean, validationOptions?: ValidationOptions): PropertyDecorator {
  return applyDecorators(
    CvValidateIf(condition, validationOptions),
    ApiProperty({ required: false }),
  );
}

/**
 * Objects / object arrays marked with this decorator will also be validated.
 * @param validationOptions
 */
export function ValidateNested(validationOptions?: ValidationOptions): PropertyDecorator {
  return applyDecorators(
    CvValidateNested(validationOptions),
    ApiProperty(),
  );
}

/**
 * Checks if value is defined (!== undefined, !== null).
 * @param validationOptions
 */
export function IsDefined(validationOptions?: ValidationOptions): PropertyDecorator {
  return applyDecorators(
    CvIsDefined(validationOptions),
    ApiProperty(),
  );
}

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
 * Checks if value equals ("===") comparison.
 * @param comparison
 * @param validationOptions
 */
export function Equals(comparison: any, validationOptions?: ValidationOptions): PropertyDecorator {
  return applyDecorators(
    CvEquals(comparison, validationOptions),
    ApiProperty(),
  );
}

/**
 * Checks if value not equal ("!==") comparison.
 * @param comparison
 * @param validationOptions
 */
export function NotEquals(comparison: any, validationOptions?: ValidationOptions): PropertyDecorator {
  return applyDecorators(
    CvNotEquals(comparison, validationOptions),
    ApiProperty(),
  );
}

/**
 * Checks if given value is empty (=== '', === null, === undefined).
 * @param validationOptions
 */
export function IsEmpty(validationOptions?: ValidationOptions): PropertyDecorator {
  return applyDecorators(
    CvIsEmpty(validationOptions),
    ApiProperty(),
  );
}

/**
 * Checks if given value is not empty (!== '', !== null, !== undefined).
 * @param validationOptions
 */
export function IsNotEmpty(validationOptions?: ValidationOptions): PropertyDecorator {
  return applyDecorators(
    CvIsNotEmpty(validationOptions),
    ApiProperty(),
  );
}

/**
 * Checks if given value is in a array of allowed values.
 * @param values
 * @param validationOptions
 */
export function IsIn(values: any[], validationOptions?: ValidationOptions): PropertyDecorator {
  return applyDecorators(
    CvIsIn(values, validationOptions),
    ApiProperty({ enum: values }),
  );
}

/**
 * Checks if value is not in a array of disallowed values.
 * @param values
 * @param validationOptions
 */
export function IsNotIn(values: any[], validationOptions?: ValidationOptions): PropertyDecorator {
  return applyDecorators(
    CvIsNotIn(values, validationOptions),
    ApiProperty(),
  );
}

// --- Type validation decorators

/**
 * Checks if a value is a boolean.
 * @param validationOptions
 */
export function IsBoolean(validationOptions?: ValidationOptions): PropertyDecorator {
  const propertyOptions = getPropertyOptions(Boolean, validationOptions);

  return applyDecorators(
    CvIsBoolean(validationOptions),
    ApiProperty({ ...propertyOptions }),
  );
}

/**
 * Checks if a value is a date.
 * @param validationOptions
 */
export function IsDate(validationOptions?: ValidationOptions): PropertyDecorator {
  const propertyOptions = getPropertyOptions(Date, validationOptions);

  return applyDecorators(
    CvIsDate(validationOptions),
    ApiProperty({ ...propertyOptions }),
  );
}

/**
 * Checks if a given value is a real string.
 * @param validationOptions
 */
export function IsString(validationOptions?: ValidationOptions): PropertyDecorator {
  const propertyOptions = getPropertyOptions(String, validationOptions);

  return applyDecorators(
    CvIsString(validationOptions),
    ApiProperty({ ...propertyOptions }),
  );
}

/**
 * Checks if a value is a number.
 * @param options
 * @param validationOptions
 */
export function IsNumber(options: IsNumberOptions = { }, validationOptions?: ValidationOptions): PropertyDecorator {
  const propertyOptions = getPropertyOptions(Number, validationOptions);

  return applyDecorators(
    CvIsNumber(options, validationOptions),
    ApiProperty({ ...propertyOptions }),
  );
}

/**
 * Checks if the value is an integer number.
 * @param validationOptions
 */
export function IsInt(validationOptions?: ValidationOptions): PropertyDecorator {
  const propertyOptions = getPropertyOptions(Number, validationOptions);

  return applyDecorators(
    CvIsInt(validationOptions),
    ApiProperty({ ...propertyOptions }),
  );
}

/**
 * Checks if a given value is an array.
 * @param validationOptions
 */
export function IsArray(validationOptions?: ValidationOptions): PropertyDecorator {
  return applyDecorators(
    CvIsArray(validationOptions),
    ApiProperty(),
  );
}

/**
 * Checks if a given value is an enum.
 * @param entity
 * @param validationOptions
 */
export function IsEnum(entity: object, validationOptions?: ValidationOptions): PropertyDecorator {
  return applyDecorators(
    CvIsEnum(entity, validationOptions),
    ApiProperty(),
  );
}

// --- Number validation decorators

// @IsDivisibleBy(num: number)	Checks if the value is a number that's divisible by another.
// @IsPositive()	Checks if the value is a positive number greater than zero.
// @IsNegative()	Checks if the value is a negative number smaller than zero.

/**
 * Checks if the first number is greater than or equal to the second.
 * @param minValue
 * @param validationOptions
 */
export function Min(minValue: number, validationOptions?: ValidationOptions): PropertyDecorator {
  const propertyOptions = getPropertyOptions(Number, validationOptions);

  return applyDecorators(
    CvMin(minValue, validationOptions),
    ApiProperty({ ...propertyOptions, minimum: minValue }),
  );
}

/**
 * Checks if the first number is less than or equal to the second.
 * @param maxValue
 * @param validationOptions
 */
export function Max(maxValue: number, validationOptions?: ValidationOptions): PropertyDecorator {
  const propertyOptions = getPropertyOptions(Number, validationOptions);

  return applyDecorators(
    CvMax(maxValue, validationOptions),
    ApiProperty({ ...propertyOptions, maximum: maxValue }),
  );
}

// --- Date validation decorators

// @MinDate(date: Date)	Checks if the value is a date that's after the specified date.
// @MaxDate(date: Date) Checks if the value is a date that's before the specified date.

// --- String-type validation decorators

// @IsBooleanString()	Checks if a string is a boolean (e.g. is "true" or "false").
// @IsDateString()	Alias for @IsISO8601().

/**
 * Checks if a value is a number.
 * @param options
 * @param validationOptions
 */
export function IsNumberString(options?: any, validationOptions?: ValidationOptions): PropertyDecorator {
  const propertyOptions = getPropertyOptions(String, validationOptions);

  return applyDecorators(
    CvIsNumberString(options, validationOptions),
    ApiProperty({ ...propertyOptions, description: 'Must be numeric' }),
  );
}

// --- String validation decorators

/**
 * Checks if the string contains the seed.
 * If given value is not a string, then it returns false.
 * @param seed
 * @param validationOptions
 */
export function Contains(seed: string, validationOptions?: ValidationOptions): PropertyDecorator {
  const propertyOptions = getPropertyOptions(String, validationOptions);

  return applyDecorators(
    CvContains(seed, validationOptions),
    ApiProperty({ ...propertyOptions, description: `Must contain: \`${seed}\`` }),
  );
}

/**
 * CChecks if the string does not contain the seed.
 * If given value is not a string, then it returns false.
 * @param seed
 * @param validationOptions
 */
export function NotContains(seed: string, validationOptions?: ValidationOptions): PropertyDecorator {
  const propertyOptions = getPropertyOptions(String, validationOptions);

  return applyDecorators(
    CvNotContains(seed, validationOptions),
    ApiProperty({ ...propertyOptions, description: `Must not contain: \`${seed}\`` }),
  );
}

// @NotContains(seed: string)	Checks if the string not contains the seed.
// @IsAlpha()	Checks if the string contains only letters (a-zA-Z).
// @IsAlphanumeric()	Checks if the string contains only letters and numbers.
// @IsDecimal(options?: IsDecimalOptions)	Checks if the string is a valid decimal value. Default IsDecimalOptions are force_decimal=False, decimal_digits: '1,', locale: 'en-US'
// @IsAscii()	Checks if the string contains ASCII chars only.
// @IsBase32()	Checks if a string is base32 encoded.
// @IsBase64()	Checks if a string is base64 encoded.
// @IsIBAN()	Checks if a string is a IBAN (International Bank Account Number).
// @IsBIC()	Checks if a string is a BIC (Bank Identification Code) or SWIFT code.
// @IsByteLength(min: number, max?: number)	Checks if the string's length (in bytes) falls in a range.
// @IsCreditCard()	Checks if the string is a credit card.
// @IsCurrency(options?: IsCurrencyOptions)	Checks if the string is a valid currency amount.
// @IsEthereumAddress()	Checks if the string is an Ethereum address using basic regex. Does not validate address checksums.
// @IsBtcAddress()	Checks if the string is a valid BTC address.
// @IsDataURI()	Checks if the string is a data uri format.

/**
 * Checks if the string is an email. If given value is not a string, then it returns false.
 * @param options
 * @param validationOptions
 */
export function IsEmail(options?: any, validationOptions?: ValidationOptions): PropertyDecorator {
  const propertyOptions = getPropertyOptions(String, validationOptions);

  return applyDecorators(
    CvIsEmail(options, validationOptions),
    ApiProperty({ ...propertyOptions, description: 'Must be an e-mail' }),
  );
}

// @IsFQDN(options?: IsFQDNOptions)	Checks if the string is a fully qualified domain name (e.g. domain.com).
// @IsFullWidth()	Checks if the string contains any full-width chars.
// @IsHalfWidth()	Checks if the string contains any half-width chars.
// @IsVariableWidth()	Checks if the string contains a mixture of full and half-width chars.
// @IsHexColor()	Checks if the string is a hexadecimal color.
// @IsHSLColor()	Checks if the string is an HSL color based on CSS Colors Level 4 specification.
// @IsRgbColor(options?: IsRgbOptions)	Checks if the string is a rgb or rgba color.
// @IsIdentityCard(locale?: string)	Checks if the string is a valid identity card code.
// @IsPassportNumber(countryCode?: string)	Checks if the string is a valid passport number relative to a specific country code.
// @IsPostalCode(locale?: string)	Checks if the string is a postal code.
// @IsHexadecimal()	Checks if the string is a hexadecimal number.
// @IsOctal()	Checks if the string is a octal number.
// @IsMACAddress(options?: IsMACAddressOptions)	Checks if the string is a MAC Address.
// @IsIP(version?: "4"|"6")	Checks if the string is an IP (version 4 or 6).
// @IsPort()	Checks if the string is a valid port number.
// @IsISBN(version?: "10"|"13")	Checks if the string is an ISBN (version 10 or 13).
// @IsEAN()	Checks if the string is an if the string is an EAN (European Article Number).
// @IsISIN()	Checks if the string is an ISIN (stock/security identifier).

/**
 * Checks if the string is a valid ISO 8601 date.
 * If given value is not a string, then it returns false.
 * Use the option strict = true for additional checks for a valid date,
 * e.g. Invalidates dates like 2019-02-29.
 * @param options
 * @param validationOptions
 */
export function IsISO8601(options?: any, validationOptions?: ValidationOptions): PropertyDecorator {
  const propertyOptions = getPropertyOptions(String, validationOptions);

  return applyDecorators(
    CvIsISO8601(options, validationOptions),
    ApiProperty({ ...propertyOptions, description: 'Must obey ISO8601: `YYYY-MM-DD`' }),
  );
}

// @IsJSON()	Checks if the string is valid JSON.
// @IsJWT()	Checks if the string is valid JWT.

/**
 * Checks if the value is valid Object. Returns false if the value is not an object.
 * @param validationOptions
 */
export function IsObject(validationOptions?: ValidationOptions): PropertyDecorator {
  return applyDecorators(
    CvIsObject(validationOptions),
    ApiProperty(),
  );
}

// @IsNotEmptyObject()	Checks if the object is not empty.
// @IsLowercase()	Checks if the string is lowercase.
// @IsLatLong()	Checks if the string is a valid latitude-longitude coordinate in the format lat, long.
// @IsLatitude()	Checks if the string or number is a valid latitude coordinate.
// @IsLongitude()	Checks if the string or number is a valid longitude coordinate.
// @IsMobilePhone(locale: string)	Checks if the string is a mobile phone number.
// @IsISO31661Alpha2()	Checks if the string is a valid ISO 3166-1 alpha-2 officially assigned country code.
// @IsISO31661Alpha3()	Checks if the string is a valid ISO 3166-1 alpha-3 officially assigned country code.
// @IsLocale()	Checks if the string is a locale.
// @IsPhoneNumber(region: string)	Checks if the string is a valid phone numberusing libphonenumber-js.
// @IsMongoId()	Checks if the string is a valid hex-encoded representation of a MongoDB ObjectId.
// @IsMultibyte()	Checks if the string contains one or more multibyte chars.
// @IsNumberString(options?: IsNumericOptions)	Checks if the string is numeric.
// @IsSurrogatePair()	Checks if the string contains any surrogate pairs chars.
// @IsUrl(options?: IsURLOptions)	Checks if the string is an url.
// @IsMagnetURI()	Checks if the string is a magnet uri format.

/**
 * Checks if the string is a UUID (version 3, 4 or 5). If given value is not a string, then it returns false.
 * @param version
 * @param validationOptions
 */
export function IsUUID(version?: UUIDVersion, validationOptions?: ValidationOptions): PropertyDecorator {
  const propertyOptions = getPropertyOptions(String, validationOptions);

  return applyDecorators(
    CvIsUUID(version, validationOptions),
    ApiProperty({ ...propertyOptions, description: 'Must be an UUID' }),
  );
}

// @IsFirebasePushId()	Checks if the string is a Firebase Push ID
// @IsUppercase()	Checks if the string is uppercase.

/**
 * Checks if the string's length falls in a range.
 * @param min
 * @param max
 * @param validationOptions
 */
export function Length(min: number, max?: number, validationOptions?: ValidationOptions): PropertyDecorator {
  const propertyOptions = getPropertyOptions(String, validationOptions);

  return applyDecorators(
    CvLength(min, max, validationOptions),
    ApiProperty({ ...propertyOptions, minLength: min, maxLength: max }),
  );
}

/**
 * Checks if the string's length is not less than given number.
 * @param min
 * @param validationOptions
 */
export function MinLength(min: number, validationOptions?: ValidationOptions): PropertyDecorator {
  const propertyOptions = getPropertyOptions(String, validationOptions);

  return applyDecorators(
    CvMinLength(min, validationOptions),
    ApiProperty({ ...propertyOptions, minLength: min }),
  );
}

/**
 * Checks if the string's length is not more than given number.
 * @param max
 * @param validationOptions
 */
export function MaxLength(max: number, validationOptions?: ValidationOptions): PropertyDecorator {
  const propertyOptions = getPropertyOptions(String, validationOptions);

  return applyDecorators(
    CvMaxLength(max, validationOptions),
    ApiProperty({ ...propertyOptions, maxLength: max }),
  );
}

/**
 * Checks if string matches the pattern. Either matches('foo', /foo/i)
 * If given value is not a string, then it returns false.
 * @param regexPattern
 * @param validationOptions
 */
export function Matches(regexPattern: RegExp, validationOptions?: ValidationOptions): PropertyDecorator {
  const propertyOptions = getPropertyOptions(String, validationOptions);

  return applyDecorators(
    CvMatches(regexPattern, validationOptions),
    ApiProperty({ ...propertyOptions, description: `Must match regex: \`/${regexPattern.source}/\`` }),
  );
}

// @IsMilitaryTime()	Checks if the string is a valid representation of military time in the format HH:MM.
// @IsHash(algorithm: string)	Checks if the string is a hash The following types are supported:md4, md5, sha1, sha256, sha384, sha512, ripemd128, ripemd160, tiger128, tiger160, tiger192, crc32, crc32b.
// @IsMimeType()	Checks if the string matches to a valid MIME type format
// @IsSemVer()	Checks if the string is a Semantic Versioning Specification (SemVer).
// @IsISSN(options?: IsISSNOptions)	Checks if the string is a ISSN.
// @IsISRC()	Checks if the string is a ISRC.
// @IsRFC3339()	Checks if the string is a valid RFC 3339 date.

// --- Array validation decorators
// @ArrayContains(values: any[])	Checks if array contains all values from the given array of values.
// @ArrayNotContains(values: any[])	Checks if array does not contain any of the given values.
// @ArrayNotEmpty()	Checks if given array is not empty.
// @ArrayMinSize(min: number)	Checks if the array's length is greater than or equal to the specified number.
// @ArrayMaxSize(max: number)	Checks if the array's length is less or equal to the specified number.
// @ArrayUnique(identifier?: (o) => any)	Checks if all array's values are unique. Comparison for objects is reference-based. Optional function can be speciefied which return value will be used for the comparsion.

// --- Object validation decorators
// @IsInstance(value: any)	Checks if the property is an instance of the passed value.

// --- Other decorators
// @Allow()	Prevent stripping off the property when no other constraint is specified for it.
