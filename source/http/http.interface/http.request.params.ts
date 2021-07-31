import { OptionsOfUnknownResponseBody } from 'got';

export interface HttpRequestParams extends OptionsOfUnknownResponseBody {
  /** In case of an exception, ignore it and return the response object. */
  ignoreExceptions?: boolean;
  /** Object containing replacement string for path variables. */
  replacements?: Record<string, string>;
  /** Overwrite search params adding the ability to provide array values. */
  query?: Record<string, any>;
}
