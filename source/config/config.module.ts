import { DynamicModule, Module } from '@nestjs/common';

import { AppModule } from '../app/app.module';
import { ConfigModuleOptions } from './config.interface';
import { ConfigService } from './config.service';

@Module({ })
export class ConfigModule {

  /**
   * During initialization, create a cache of all required secrets.
   * @param options
   */
  public static register(options: ConfigModuleOptions = { }): DynamicModule {
    options.envPath ??= AppModule.searchEnvFile();
    ConfigService.setupSecretEnvironment(options);

    return {
      module: ConfigModule,
    };
  }

}
