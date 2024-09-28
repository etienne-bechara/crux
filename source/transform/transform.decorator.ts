/* eslint-disable @typescript-eslint/naming-convention */
import { applyDecorators, HttpCode, HttpStatus, SetMetadata } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

import { AppMetadataKey } from '../app/app.enum';
import { TransformToArrayOptions, TransformToStringOptions } from './transform.interface';

/**
 * Specifies response body class in order to trigger
 * outbound payload validation.
 * @param status
 * @param cls
 */
export function Response(status: HttpStatus, cls?: any): MethodDecorator {
  return applyDecorators(
    HttpCode(status),
    SetMetadata(AppMetadataKey.RESPONSE_CLASS, cls),
    ApiResponse({ status, type: cls }),
  );
}

/**
 * Transforms a primitive to its corresponding boolean.
 */
export function ToBoolean(): any {
  return applyDecorators(
    Transform((o) => {
      const { value } = o;
      if (value === undefined) return;

      switch (value) {
        case 'false': {
          return false;
        }

        case 'true': {
          return true;
        }

        case 0: {
          return false;
        }

        case 1: {
          return true;
        }

        case false: {
          return false;
        }

        case true: {
          return true;
        }

        default: {
          return null;
        }
      }
    }, {
      toClassOnly: true,
    }),
  );
}

/**
 * Transforms a string or number to JS date.
 */
export function ToDate(): any {
  return applyDecorators(
    Transform((o) => {
      const { value } = o;
      if (value === undefined) return;

      try {
        return new Date(value as string);
      }
      catch {
        return null;
      }
    }, {
      toClassOnly: true,
    }),
  );
}

/**
 * Transforms a string or number to number.
 */
export function ToNumber(): any {
  return applyDecorators(
    Transform((o) => {
      const { value } = o;
      if (value === undefined || value === null) return value;

      const number = Number(value);
      if (!number && number !== 0) return null;

      return number;
    }, {
      toClassOnly: true,
    }),
  );
}

/**
 * Transforms to string and desired case.
 * @param options
 */
export function ToString(options: TransformToStringOptions = { }): any {
  return applyDecorators(
    Transform((o) => {
      const { value } = o;
      if (value === undefined) return;

      const str: string = value?.toString?.();
      if (!str && str !== '') return null;

      switch (options.case) {
        case 'lower': {
          return str.toLowerCase();
        }

        case 'upper': {
          return str.toUpperCase();
        }

        case 'title': {
          return str.toLowerCase().replaceAll(/\b[a-z]/g, (x) => x.toUpperCase());
        }

        default: { return str;
        }
      }
    }, {
      toClassOnly: true,
    }),
  );
}

/**
 * Ensures input string or string array, outputs as an array of unique strings.
 * @param input
 * @param options
 */
function toArray(input: string | string[], options: TransformToArrayOptions = { }): string[] {
  if (input === undefined) return;
  if (!input) return [ ];

  options.splitBy ??= [ ',' ];

  const inputArray: string[] = Array.isArray(input) ? input : [ input ];
  const splitRegex = new RegExp(`[${options.splitBy.join('')}]`, 'g');
  const splitArray = inputArray.flatMap((s) => s.split(splitRegex));

  return [ ...new Set(splitArray) ];
}

/**
 * Ensures input string or string array, outputs as an array of strings
 * with unique entries.
 *
 * Separators can be configured by `splitBy`, which defaults to comma.
 * @param options
 */
export function ToStringArray(options: TransformToArrayOptions = { }): any {
  return applyDecorators(
    Transform((o) => {
      const { value } = o;
      return toArray(value as string | string[], options);
    }, {
      toClassOnly: true,
    }),
  );
}

/**
 * Ensures input string or string array, outputs as an array of numbers
 * with unique entries.
 *
 * Separators can be configured by `splitBy`, which defaults to comma.
 * @param options
 */
export function ToNumberArray(options: TransformToArrayOptions = { }): any {
  return applyDecorators(
    Transform((o) => {
      const { value } = o;
      return toArray(value as string | string[], options)?.map(Number);
    }, {
      toClassOnly: true,
    }),
  );
}
