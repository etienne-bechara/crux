import { DynamicModule, Module } from '@nestjs/common';

import { UtilModule } from '../util/util.module';
import { ConfigModuleOptions } from './config.interface';
import { ConfigService } from './config.service';

@Module({ })
export class ConfigModule {

  /**
   * During initialization, create a cache of all required secrets.
   * @param options
   */
  public static register(options: ConfigModuleOptions = { }): DynamicModule {
    options.envPath ??= UtilModule.searchEnvFile();
    ConfigService.setupSecretEnvironment(options);

    return {
      module: ConfigModule,
    };
  }

}
