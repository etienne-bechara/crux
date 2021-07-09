/* eslint-disable @typescript-eslint/naming-convention */
import { TransformFnParams } from 'class-transformer';

/**
 * Ensures string input is exactly 'true' or 'false'.
 * @param params
 */
export function TransformStringBoolean(params: TransformFnParams): boolean {
  const { value } = params;
  if (!value || ![ 'true', 'false' ].includes(value)) return;
  return value === 'true';
}

/**
 * Ensures target query params outputs as an array with unique entries.
 *
 * Possible entries are:
 * - Single string with items separated by comma, semicolon or pipe
 * - Single string without separator
 * - String array
 * - Combination of 1 and 3.
 * @param params
 */
export function TransformStringArray(params: TransformFnParams): string[] {
  const { value } = params;
  if (!value) return;

  const valueArray: string[] = Array.isArray(value) ? value : [ value ];
  const splitArray = valueArray.flatMap((s) => s.split(/[,;|]+/g));

  return [ ...new Set(splitArray) ];
}
