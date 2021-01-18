export interface AppBootOptions {
  envPath?: string;
  disableSourceImports?: boolean;
  disableDefaultImports?: boolean;
  disableDefaultFilters?: boolean;
  disableDefaultInterceptors?: boolean;
  disableDefaultPipes?: boolean;
  configs?: any[];
  modules?: any[];
}
