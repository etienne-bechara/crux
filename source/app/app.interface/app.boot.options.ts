export interface AppBootOptions {
  envPath?: string;
  loadDefaultConfigs?: boolean;
  loadDefaultModules?: boolean;
  loadSourceConfigs?: boolean;
  loadSourceModules?: boolean;
  configs?: any[];
  modules?: any[];
}
