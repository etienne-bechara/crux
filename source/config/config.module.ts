import { DynamicModule, Module } from '@nestjs/common';

import { UtilModule } from '../util/util.module';
import { ConfigModuleOptions } from './config.interface';
import { ConfigService } from './config.service';

@Module({ })
export class ConfigModule {

  /**
   * During initialization, asynchronously create a cache
   * of all required secrets.
   * @param options
   */
  public static async registerAsync(options: ConfigModuleOptions = { }): Promise<DynamicModule> {
    if (!options.envPath) options.envPath = UtilModule.searchEnvFile();
    await ConfigService.setupSecretEnvironment(options);
    return { module: ConfigModule };
  }

}
