import { TestingModuleBuilder } from '@nestjs/testing';

export interface TestSandboxOptions {
  name: string;
  skip?: boolean;
  imports?: any[];
  controllers?: any[];
  providers?: any[];
  exports?: any[];
  configs?: any[];
  descriptor: (testingBuilder: TestingModuleBuilder) => void;
}
