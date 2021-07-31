import { OptionsOfUnknownResponseBody } from 'got';

export interface HttpRequestParams extends OptionsOfUnknownResponseBody {
  /** Object containing replacement string for path variables. */
  replacements?: Record<string, string>;
  searchParams?: Record<string, any>;
}
