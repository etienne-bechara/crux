module.exports = {
  rootDir: '../../source',
  coverageDirectory: 'coverage',
  testEnvironment: 'node',
  testRegex: '.spec.ts$',
  transform: {
    'ts$': 'ts-jest',
  },
}
