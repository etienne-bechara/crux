export interface ConfigModuleOptions {
  allowValidationErrors?: boolean;
  envPath?: string;
}

export interface ConfigInjectionOptions {
  key?: string;
  baseValue?: any;
  jsonParse?: boolean;
}

export interface ConfigSecretRecord extends ConfigInjectionOptions {
  value?: any;
}
