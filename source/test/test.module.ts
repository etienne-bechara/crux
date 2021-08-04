/* eslint-disable no-console */
/* eslint-disable jest/no-disabled-tests */
/* eslint-disable jest/valid-title */
import { Test } from '@nestjs/testing';
import dotenv from 'dotenv';

import { ConfigModule } from '../config/config.module';
import { UtilModule } from '../util/util.module';
import { TestSandboxOptions } from './test.interface';

/**
 * This module is not exposed in package index due to
 * requirement of dev dependencies.
 *
 * Refer to Test section of documentation for more info
 * regarding usage.
 */
export class TestModule {

  /**
   * Creates a NestJS testing sandbox adding support for
   * conditional skipping and secret configuration files.
   * @param options
   */
  public static createSandbox(options: TestSandboxOptions): void {
    const { name, descriptor, envPath, configs, imports, controllers, providers, skip } = options;
    const path = envPath || UtilModule.searchEnvFile();
    const envFile = dotenv.config({ path }).parsed || { };
    process.env = { ...process.env, ...envFile };

    if (skip?.()) {
      describe.skip(name, () => descriptor(null));
      return;
    }

    if (!imports) {
      options.imports = [ ];
    }

    if (configs) {
      imports.unshift(
        ConfigModule.register({ configs }),
      );
    }

    const testingBuilder = Test.createTestingModule({
      imports: imports,
      providers: [
        ...providers ? providers : [ ],
      ],
      controllers: [
        ...controllers ? controllers : [ ],
      ],
    });

    describe(name, () => {
      console.log = jest.fn();
      console.warn = jest.fn();
      descriptor(testingBuilder);
    });
  }

}
