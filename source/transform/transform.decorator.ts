/* eslint-disable @typescript-eslint/naming-convention */
import { applyDecorators } from '@nestjs/common';
import { Transform } from 'class-transformer';

import { TransformToStringArrayOptions, TransformToStringOptions } from './transform.interface';

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
 * Ensures target string or string array outputs as an array with unique entries.
 * Separators can be configured by `splitBy`, which defaults to comma.
 * @param options
 */
export function ToStringArray(options: TransformToStringArrayOptions = { }): any {
  options.splitBy ??= [ ',' ];

  return applyDecorators(
    Transform((o) => {
      const { value } = o;
      if (value === undefined) return;

      if (!value) return [ ];

      const valueArray: string[] = Array.isArray(value) ? value : [ value ];
      const splitRegex = new RegExp(`[${options.splitBy.join('')}]`, 'g');
      const splitArray = valueArray.flatMap((s) => s.split(splitRegex));

      return [ ...new Set(splitArray) ];
    }, {
      toClassOnly: true,
    }),
  );
}
