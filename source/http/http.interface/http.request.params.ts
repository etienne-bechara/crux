import { OptionsOfTextResponseBody } from 'got';

export interface HttpRequestParams extends OptionsOfTextResponseBody {
  /** Object containing replacement string for path variables. */
  replacements?: Record<string, string>;
}
