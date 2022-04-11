import { AppEnvironment } from '../app/app.enum';

export interface ConfigModuleOptions {
  allowValidationErrors?: boolean;
  envPath?: string;
}

export interface ConfigInjectionOptions {
  /** Key when storing secret, defaults to annotated property name. */
  key?: string;
  /** Returning value when secret is `null` or `undefined`. */
  fallback?: string | number | boolean | ((environment: AppEnvironment) => string | number | boolean);
  /** When enabled attempts to parse the secret as JSON. */
  json?: boolean;
}

export interface ConfigRecord extends ConfigInjectionOptions {
  value?: any;
}
