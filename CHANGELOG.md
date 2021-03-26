## [1.5.2](https://github.com/etienne-bechara/nestjs-core/compare/v1.5.1...v1.5.2) (2021-03-26)


### Performance Improvements

* make configurations easier to use and add better https service debugging ([d832d3c](https://github.com/etienne-bechara/nestjs-core/commit/d832d3cb78b15aaef9d32e38e8554a4322708235))

## [1.5.1](https://github.com/etienne-bechara/nestjs-core/compare/v1.5.0...v1.5.1) (2021-03-12)


### Bug Fixes

* **app:** type signature fixes ([942f3ab](https://github.com/etienne-bechara/nestjs-core/commit/942f3ab50be5b964ce65601c39a80b15ea58c424))

# [1.5.0](https://github.com/etienne-bechara/nestjs-core/compare/v1.4.0...v1.5.0) (2021-01-18)


### Features

* **config:** remove config freeze and use metadata keys ([7e22f40](https://github.com/etienne-bechara/nestjs-core/commit/7e22f40e91e1214f280dcdc11c59d23ab88e0fd2))
* **https:** add request cache support ([5005287](https://github.com/etienne-bechara/nestjs-core/commit/5005287fb3f5f77ba485bc821760865c8bc70747))
* **slack:** add slack logger transport ([ec04258](https://github.com/etienne-bechara/nestjs-core/commit/ec0425802200c6a3ea752308b744a30cbbe432a1))
* **util:** add sensitive keys removal tool ([6db00b9](https://github.com/etienne-bechara/nestjs-core/commit/6db00b9b4a471064fc032cf0d72231351e2fdf62))
* add more boot disable options and automatic jwt flattening ([5ac1e56](https://github.com/etienne-bechara/nestjs-core/commit/5ac1e56255cf5da38916b952986b6f54059e9b80))

# [1.4.0](https://github.com/etienne-bechara/nestjs-core/compare/v1.3.2...v1.4.0) (2020-11-14)


### Features

* add sourcemap support ([130624d](https://github.com/etienne-bechara/nestjs-core/commit/130624dbc59bd15977bd115869c92eb3b89f7b39))

## [1.3.2](https://github.com/etienne-bechara/nestjs-core/compare/v1.3.1...v1.3.2) (2020-11-13)


### Bug Fixes

* move chalk to bungle dependency ([16e266d](https://github.com/etienne-bechara/nestjs-core/commit/16e266d6337d9f0ce745e03d7aecea75c09aaefd))

## [1.3.1](https://github.com/etienne-bechara/nestjs-core/compare/v1.3.0...v1.3.1) (2020-11-13)


### Bug Fixes

* attempt to find env file automatically ([dbf258b](https://github.com/etienne-bechara/nestjs-core/commit/dbf258b1208bff0ab09cdbf8a9da95a35ab586dd))
* simplify config method ([c6aa947](https://github.com/etienne-bechara/nestjs-core/commit/c6aa9471cdd393f1c5b49c9cc117f53d8f687ccb))

# [1.3.0](https://github.com/etienne-bechara/nestjs-core/compare/v1.2.0...v1.3.0) (2020-11-07)


### Features

* improve http module and reduce dependencies ([6b8e2b8](https://github.com/etienne-bechara/nestjs-core/commit/6b8e2b8e696853c7182f95656e9e685d2a794fc6))

# [1.2.0](https://github.com/etienne-bechara/nestjs-core/compare/v1.1.0...v1.2.0) (2020-11-04)


### Features

* add json decoding to middleware (no validation) ([470039c](https://github.com/etienne-bechara/nestjs-core/commit/470039c39cb3524f6c97e0cf7c30ddbfd3abf2fe))

# [1.1.0](https://github.com/etienne-bechara/nestjs-core/compare/v1.0.4...v1.1.0) (2020-11-03)


### Features

* allow all base configs to be injected through environment ([8f716a1](https://github.com/etienne-bechara/nestjs-core/commit/8f716a1a79d8041ef9403a94b9a084072984d43f))

## [1.0.4](https://github.com/etienne-bechara/nestjs-core/compare/v1.0.3...v1.0.4) (2020-11-03)


### Bug Fixes

* correctly resolve module interdepencies to prevent using globals ([4a145d1](https://github.com/etienne-bechara/nestjs-core/commit/4a145d1cbee7a064b9673da5f5f3ab74d07ef9f9))

## [1.0.3](https://github.com/etienne-bechara/nestjs-core/compare/v1.0.2...v1.0.3) (2020-11-03)


### Bug Fixes

* add all core modules to the test module ([21128c0](https://github.com/etienne-bechara/nestjs-core/commit/21128c07aba61fb8082fff3de8aa50c898c12b1c))

## [1.0.2](https://github.com/etienne-bechara/nestjs-core/compare/v1.0.1...v1.0.2) (2020-11-03)


### Bug Fixes

* add test as valid environment (used by jest) ([d6ba43b](https://github.com/etienne-bechara/nestjs-core/commit/d6ba43b95cb43b9973181671a7f7bdcebeeb4888))

## [1.0.1](https://github.com/etienne-bechara/nestjs-core/compare/v1.0.0...v1.0.1) (2020-11-02)


### Bug Fixes

* add missing build step ([6976028](https://github.com/etienne-bechara/nestjs-core/commit/6976028b9d209a82fcf9c0bfee060dce98a6deed))

# 1.0.0 (2020-11-02)


### Features

* initial version with config, https, logger, util and app modules ([cc5aeba](https://github.com/etienne-bechara/nestjs-core/commit/cc5aebaf44f8a56bcd599ef6d3af538e83504b8a))
