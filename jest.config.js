/** @type {import('jest').Config} */
const config = {
  rootDir: 'source',
  verbose: true,
  forceExit: true,
  collectCoverage: true,
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  testRegex: '.spec.ts$',
  testResultsProcessor: 'jest-sonar-reporter',
  testTimeout: 30000,
  transform: {
    ts$: 'ts-jest',
  },
};

module.exports = config;
