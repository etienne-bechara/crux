# [4.4.0](https://github.com/etienne-bechara/nestjs-core/compare/v4.3.1...v4.4.0) (2022-03-12)


### Bug Fixes

* allow metrics options to be configured ([9bc07c0](https://github.com/etienne-bechara/nestjs-core/commit/9bc07c06eaaec44002c475008a0af45640efc7df))
* open api default description and version ([5112c52](https://github.com/etienne-bechara/nestjs-core/commit/5112c5289c002bedcae94889fb01ce04a64b7a2e))
* rxjs version ([999a287](https://github.com/etienne-bechara/nestjs-core/commit/999a2877ea4c230038679524ec0f800c8f01decb))


### Features

* add metrics pushgateway support ([a7fa280](https://github.com/etienne-bechara/nestjs-core/commit/a7fa280a2f08491e832f77c2177c120c7066cda9))

## [4.3.1](https://github.com/etienne-bechara/nestjs-core/compare/v4.3.0...v4.3.1) (2022-03-12)


### Bug Fixes

* add details to slack message as link ([f11397f](https://github.com/etienne-bechara/nestjs-core/commit/f11397f976237b16576425367f1456aa5e0347a6))
* add ValidateIf override ([16e95fe](https://github.com/etienne-bechara/nestjs-core/commit/16e95feb0080914a12e0203be9d9d48a541acd7c))
* enable exception filter to handle fastify excpetions ([2132ce7](https://github.com/etienne-bechara/nestjs-core/commit/2132ce7bda214e80af439d2d22e448846e10a7c6))
* rename logger filename to caller and add line ([7a21a25](https://github.com/etienne-bechara/nestjs-core/commit/7a21a2520e474f038dbf4b63d7a7653add37a0c2))
* validator overwrites ([885c011](https://github.com/etienne-bechara/nestjs-core/commit/885c011ba05352b15da2b8fa8f8f4536fe29558c))

# [4.3.0](https://github.com/etienne-bechara/nestjs-core/compare/v4.2.5...v4.3.0) (2022-03-08)


### Bug Fixes

* allow all params of ApiOperation to be configured on mehod decorators ([f8dbb1a](https://github.com/etienne-bechara/nestjs-core/commit/f8dbb1ace6dc1d7b5b855828d3f54c2b57da455d))
* improve pattern descriptions ([9fc236b](https://github.com/etienne-bechara/nestjs-core/commit/9fc236b94d18f65cb860f57e9410528d386d68d2))


### Features

* add @IsUUID() override ([0d30f21](https://github.com/etienne-bechara/nestjs-core/commit/0d30f213de931b72f5ae42c0679438b1b31de2ea))
* add OneOf() validator ([f29973b](https://github.com/etienne-bechara/nestjs-core/commit/f29973b45b52b6b26ec06fc39e0cc058a114290a))

## [4.2.5](https://github.com/etienne-bechara/nestjs-core/compare/v4.2.4...v4.2.5) (2022-03-04)


### Bug Fixes

* do not spread inbound request on exception log ([0d8ea14](https://github.com/etienne-bechara/nestjs-core/commit/0d8ea14545733a09e5f6d7066df90c2c81a2cb7a))

## [4.2.4](https://github.com/etienne-bechara/nestjs-core/compare/v4.2.3...v4.2.4) (2022-03-04)


### Bug Fixes

* slack fatal emoji ([77248b0](https://github.com/etienne-bechara/nestjs-core/commit/77248b06043bf9e51ece1a39b820ecabcea7c7f8))

## [4.2.3](https://github.com/etienne-bechara/nestjs-core/compare/v4.2.2...v4.2.3) (2022-03-04)


### Bug Fixes

* slack URL encoding ([9bc6b58](https://github.com/etienne-bechara/nestjs-core/commit/9bc6b58413f3dc2f9ca1e4faab77af7fbbb7f02f))

## [4.2.2](https://github.com/etienne-bechara/nestjs-core/compare/v4.2.1...v4.2.2) (2022-03-04)


### Bug Fixes

* logger severity order ([0ec5f6e](https://github.com/etienne-bechara/nestjs-core/commit/0ec5f6eab4107113b09b7392263f70fceff8b342))

## [4.2.1](https://github.com/etienne-bechara/nestjs-core/compare/v4.2.0...v4.2.1) (2022-03-04)


### Bug Fixes

* improve consoe logging style ([9499ed9](https://github.com/etienne-bechara/nestjs-core/commit/9499ed9b7ee67955946c3cc42ca18e1221e8a86b))

# [4.2.0](https://github.com/etienne-bechara/nestjs-core/compare/v4.1.0...v4.2.0) (2022-03-04)


### Bug Fixes

* test circular deps ([284b20d](https://github.com/etienne-bechara/nestjs-core/commit/284b20d8e4ab669c56ab088e60dc1d4aaa54c6ea))


### Features

* add class-validator decorators integration with docs ([4be78dd](https://github.com/etienne-bechara/nestjs-core/commit/4be78dd0eb87c7639fc265cc6d376d672b9b1094))

# [4.1.0](https://github.com/etienne-bechara/nestjs-core/compare/v4.0.3...v4.1.0) (2022-03-03)


### Bug Fixes

* config interfaces ([631e547](https://github.com/etienne-bechara/nestjs-core/commit/631e5477864fc3bfb6fa0e925d0496fd0e2cf74d))
* prevent slack exception loop ([0f8af1b](https://github.com/etienne-bechara/nestjs-core/commit/0f8af1bdd1f37f3aa19ad683359597295ac0cdd0))
* rename storage as memory and do not overwrite TTLs ([caad056](https://github.com/etienne-bechara/nestjs-core/commit/caad056ad159fe4b6cf65fe3dff17c3cbb4149bb))


### Features

* add automatic documentation for controller and methods ([23e1bfa](https://github.com/etienne-bechara/nestjs-core/commit/23e1bfa8f8b5a81c7eef57d95c7638f51141c21f))
* add basic class-validator override for auto documentation ([840bbf5](https://github.com/etienne-bechara/nestjs-core/commit/840bbf5fac30100ed86eab416dae96c67853fb7e))

## [4.0.3](https://github.com/etienne-bechara/nestjs-core/compare/v4.0.2...v4.0.3) (2022-03-03)


### Bug Fixes

* add handlebars to output ([a764e3a](https://github.com/etienne-bechara/nestjs-core/commit/a764e3acf94b006af00c46c64f6a55ac4f2784cd))

## [4.0.2](https://github.com/etienne-bechara/nestjs-core/compare/v4.0.1...v4.0.2) (2022-03-03)


### Bug Fixes

* remove unnecessary configs ([a24a3c2](https://github.com/etienne-bechara/nestjs-core/commit/a24a3c2eb513e146f028122952316f1bf78cbb95))

## [4.0.1](https://github.com/etienne-bechara/nestjs-core/compare/v4.0.0...v4.0.1) (2022-03-03)


### Bug Fixes

* config circular deps ([497fd97](https://github.com/etienne-bechara/nestjs-core/commit/497fd97293d6d3ff6901947604a5b964e9792220))
* typo ([c83ce68](https://github.com/etienne-bechara/nestjs-core/commit/c83ce680fd0b8ae348b8cac50c400f0306c1a724))

# [4.0.0](https://github.com/etienne-bechara/nestjs-core/compare/v3.6.2...v4.0.0) (2022-03-03)


### Bug Fixes

* add sensitive keys as app options ([72de7f8](https://github.com/etienne-bechara/nestjs-core/commit/72de7f84e858ae4d61a87d979628935f0a2228d2))
* better default docs config merge ([d18de29](https://github.com/etienne-bechara/nestjs-core/commit/d18de291d352d309d0848392ad9b63d557440021))
* config validation exit ([2d6142c](https://github.com/etienne-bechara/nestjs-core/commit/2d6142caed90c9b3158655ab4714168cba36014c))
* context and storage services and tests ([39f8055](https://github.com/etienne-bechara/nestjs-core/commit/39f80551336e19c4e3d17ae0df828f638f27812e))
* disableMetrics to work correctly ([654250e](https://github.com/etienne-bechara/nestjs-core/commit/654250e395794fb603235f54e14157d4f27781c0))
* http inbound metrics ([04c7387](https://github.com/etienne-bechara/nestjs-core/commit/04c73872d2ffbd12ed55334b66b3cc4539fa5c8e))
* http inbound metrics ([672ef3d](https://github.com/etienne-bechara/nestjs-core/commit/672ef3d638a145da70fc57de50c5140baec13a0c))
* http messaging and slack style ([7c40a2e](https://github.com/etienne-bechara/nestjs-core/commit/7c40a2e1efd5fe246f72b795ad4b7d4fbb772b3a))
* improve http logging ([c6b5893](https://github.com/etienne-bechara/nestjs-core/commit/c6b58936eab10f535b059c96edd9f1d5b07aa05f))
* inbound/outbound nomenclature ([a3bbf88](https://github.com/etienne-bechara/nestjs-core/commit/a3bbf880be6d2cdc21237b9f9bbc2a4fa7d68423))
* metadata printing ([6628eb5](https://github.com/etienne-bechara/nestjs-core/commit/6628eb5f56e4f4fa7d76121b792f22207983d403))
* refactor logger transports ([d376d72](https://github.com/etienne-bechara/nestjs-core/commit/d376d72f211f2ee81b59ad38068cf893109add1f))
* remove crypto ([7ad4065](https://github.com/etienne-bechara/nestjs-core/commit/7ad4065a4f31d5a25776300f4c162f1928051fc4))
* rename status/statuCode to consistent code ([fdd0e70](https://github.com/etienne-bechara/nestjs-core/commit/fdd0e7039e8ac63631dd0f02dbd9ae09d2812729))
* request path and metrics example ([32d9133](https://github.com/etienne-bechara/nestjs-core/commit/32d9133ae8dd5c7fa4e828834ea97955b1574e05))
* sensitive keys replacing ([ef1b100](https://github.com/etienne-bechara/nestjs-core/commit/ef1b100896036c7fa36ad84400fe973da6e39cbb))
* typo ([f1847a3](https://github.com/etienne-bechara/nestjs-core/commit/f1847a32a274fb49c3528b258b1720c9e1100f7c))


### Features

* add default metrics collector ([41eaa26](https://github.com/etienne-bechara/nestjs-core/commit/41eaa26cf400b698f34149e201659927f81237c5))
* add inbound http histogram metric ([cf2e201](https://github.com/etienne-bechara/nestjs-core/commit/cf2e2013c6b1c4015d5071c798c797a2e079f90f))
* add outbound http metrics ([b978e7c](https://github.com/etienne-bechara/nestjs-core/commit/b978e7cd6fd161385487d02cd21c3527bce39901))
* add redoc documentation ([3721f2f](https://github.com/etienne-bechara/nestjs-core/commit/3721f2f5b4f0756105645380dff426936b5e9cb0))
* add redoc try and custom document builder ([f924176](https://github.com/etienne-bechara/nestjs-core/commit/f9241763ed361c65a74d22f1316cc49745318521))
* add request id to logging and headers ([be09e4d](https://github.com/etienne-bechara/nestjs-core/commit/be09e4dbe5edc87251a71b64d58dc134c9a83f8a))
* improve app modules options control ([680caf1](https://github.com/etienne-bechara/nestjs-core/commit/680caf1db1b47e31d59e07413aeba890e8166c62))


### BREAKING CHANGES

* improve app modules options control

# [4.0.0-beta.1](https://github.com/etienne-bechara/nestjs-core/compare/v3.6.2...v4.0.0-beta.1) (2022-02-26)


### Bug Fixes

* add sensitive keys as app options ([72de7f8](https://github.com/etienne-bechara/nestjs-core/commit/72de7f84e858ae4d61a87d979628935f0a2228d2))
* config validation exit ([2d6142c](https://github.com/etienne-bechara/nestjs-core/commit/2d6142caed90c9b3158655ab4714168cba36014c))
* context and storage services and tests ([39f8055](https://github.com/etienne-bechara/nestjs-core/commit/39f80551336e19c4e3d17ae0df828f638f27812e))
* disableMetrics to work correctly ([654250e](https://github.com/etienne-bechara/nestjs-core/commit/654250e395794fb603235f54e14157d4f27781c0))
* http inbound metrics ([04c7387](https://github.com/etienne-bechara/nestjs-core/commit/04c73872d2ffbd12ed55334b66b3cc4539fa5c8e))
* http inbound metrics ([672ef3d](https://github.com/etienne-bechara/nestjs-core/commit/672ef3d638a145da70fc57de50c5140baec13a0c))
* http messaging and slack style ([7c40a2e](https://github.com/etienne-bechara/nestjs-core/commit/7c40a2e1efd5fe246f72b795ad4b7d4fbb772b3a))
* inbound/outbound nomenclature ([a3bbf88](https://github.com/etienne-bechara/nestjs-core/commit/a3bbf880be6d2cdc21237b9f9bbc2a4fa7d68423))
* metadata printing ([6628eb5](https://github.com/etienne-bechara/nestjs-core/commit/6628eb5f56e4f4fa7d76121b792f22207983d403))
* refactor logger transports ([d376d72](https://github.com/etienne-bechara/nestjs-core/commit/d376d72f211f2ee81b59ad38068cf893109add1f))
* remove crypto ([7ad4065](https://github.com/etienne-bechara/nestjs-core/commit/7ad4065a4f31d5a25776300f4c162f1928051fc4))
* rename status/statuCode to consistent code ([fdd0e70](https://github.com/etienne-bechara/nestjs-core/commit/fdd0e7039e8ac63631dd0f02dbd9ae09d2812729))
* request path and metrics example ([32d9133](https://github.com/etienne-bechara/nestjs-core/commit/32d9133ae8dd5c7fa4e828834ea97955b1574e05))
* sensitive keys replacing ([ef1b100](https://github.com/etienne-bechara/nestjs-core/commit/ef1b100896036c7fa36ad84400fe973da6e39cbb))


### Features

* add default metrics collector ([41eaa26](https://github.com/etienne-bechara/nestjs-core/commit/41eaa26cf400b698f34149e201659927f81237c5))
* add inbound http histogram metric ([cf2e201](https://github.com/etienne-bechara/nestjs-core/commit/cf2e2013c6b1c4015d5071c798c797a2e079f90f))
* add outbound http metrics ([b978e7c](https://github.com/etienne-bechara/nestjs-core/commit/b978e7cd6fd161385487d02cd21c3527bce39901))
* add request id to logging and headers ([be09e4d](https://github.com/etienne-bechara/nestjs-core/commit/be09e4dbe5edc87251a71b64d58dc134c9a83f8a))
* improve app modules options control ([680caf1](https://github.com/etienne-bechara/nestjs-core/commit/680caf1db1b47e31d59e07413aeba890e8166c62))


### BREAKING CHANGES

* improve app modules options control

## [3.6.2](https://github.com/etienne-bechara/nestjs-core/compare/v3.6.1...v3.6.2) (2022-02-10)


### Bug Fixes

* outbound response when timeout during proxy exceptions ([92a0079](https://github.com/etienne-bechara/nestjs-core/commit/92a00794f558c1d50c8c63f522bfc927eed1d6b9))

## [3.6.1](https://github.com/etienne-bechara/nestjs-core/compare/v3.6.0...v3.6.1) (2022-01-29)


### Bug Fixes

* public ip acquisition and log domain ([ea508fb](https://github.com/etienne-bechara/nestjs-core/commit/ea508fb2533a4f1fdfe8c942f2c0666af9b615e5))

# [3.6.0](https://github.com/etienne-bechara/nestjs-core/compare/v3.5.3...v3.6.0) (2022-01-28)


### Bug Fixes

* http interface name ([9aca925](https://github.com/etienne-bechara/nestjs-core/commit/9aca9252031edf24742ad78ce12ed4f9863f0ab9))


### Features

* add async resolveLimited ([cf3e071](https://github.com/etienne-bechara/nestjs-core/commit/cf3e07172f01a98ac8777b21aab14b1683ef2fe0))

## [3.5.3](https://github.com/etienne-bechara/nestjs-core/compare/v3.5.2...v3.5.3) (2022-01-25)


### Bug Fixes

* add all 5xx errors at filter ([879803c](https://github.com/etienne-bechara/nestjs-core/commit/879803c1ee08d9de76b3e5aca3a093e7fadfcec9))
* bump deps ([a9f033c](https://github.com/etienne-bechara/nestjs-core/commit/a9f033c680ebf50476fe4650956a5dd8e8475201))

## [3.5.2](https://github.com/etienne-bechara/nestjs-core/compare/v3.5.1...v3.5.2) (2022-01-03)


### Bug Fixes

* missing exports ([dc6ac74](https://github.com/etienne-bechara/nestjs-core/commit/dc6ac742ec04ad8b221e0624c17e4be4524adbda))

## [3.5.1](https://github.com/etienne-bechara/nestjs-core/compare/v3.5.0...v3.5.1) (2022-01-03)


### Bug Fixes

* move util controller to app ([6843fe4](https://github.com/etienne-bechara/nestjs-core/commit/6843fe473d6b2698f68665ba79429c0fac87aa9b))

# [3.5.0](https://github.com/etienne-bechara/nestjs-core/compare/v3.4.2...v3.5.0) (2022-01-03)


### Bug Fixes

* change /util/status to /status ([c124906](https://github.com/etienne-bechara/nestjs-core/commit/c124906765edc5822de76496bd1dd89ea6e294e3))
* payload decoding when invalid ([72030d9](https://github.com/etienne-bechara/nestjs-core/commit/72030d954011b3ac36bef335fd8259b2840e8a39))
* separate crypto from util ([160883b](https://github.com/etienne-bechara/nestjs-core/commit/160883b8701de9d460e838f38b6a3167360c3caf))


### Features

* add local storage with ttl service ([294a5a5](https://github.com/etienne-bechara/nestjs-core/commit/294a5a5c24fdac74b9c04cf81c4771362016d3f9))

## [3.4.2](https://github.com/etienne-bechara/nestjs-core/compare/v3.4.1...v3.4.2) (2021-12-20)


### Bug Fixes

* env coalesce ([413b820](https://github.com/etienne-bechara/nestjs-core/commit/413b8205ef4c9258b140c8f43484a2250cb11745))

## [3.4.1](https://github.com/etienne-bechara/nestjs-core/compare/v3.4.0...v3.4.1) (2021-12-13)


### Bug Fixes

* require source module before configuration ([7037f0d](https://github.com/etienne-bechara/nestjs-core/commit/7037f0d9089471fd2e1d94305b76fff39cd2133c))

# [3.4.0](https://github.com/etienne-bechara/nestjs-core/compare/v3.3.7...v3.4.0) (2021-12-05)


### Bug Fixes

* bump deps ([0390c9a](https://github.com/etienne-bechara/nestjs-core/commit/0390c9aa3c9052870ea1eaf9178c087e3f197fb7))
* config test ([23417e8](https://github.com/etienne-bechara/nestjs-core/commit/23417e8e3c145452c41639fec1b14ef02b5591dd))
* increase test timeout ([d7d8872](https://github.com/etienne-bechara/nestjs-core/commit/d7d8872c13cf182a63e69f060897b0f03eb88b2f))


### Features

* add @Config() decorator ([9cd590d](https://github.com/etienne-bechara/nestjs-core/commit/9cd590d5115ef338c3a3e724d312b907d87d9536))

## [3.3.7](https://github.com/etienne-bechara/nestjs-core/compare/v3.3.6...v3.3.7) (2021-12-02)


### Bug Fixes

* decrypt when no hash ([e9b4d4f](https://github.com/etienne-bechara/nestjs-core/commit/e9b4d4f68043316517a6b8fd4b4c81d65d3fa5e8))

## [3.3.6](https://github.com/etienne-bechara/nestjs-core/compare/v3.3.5...v3.3.6) (2021-11-29)


### Bug Fixes

* add jwt metadata flattening ([f2b0148](https://github.com/etienne-bechara/nestjs-core/commit/f2b01482b5e34d375586ce8c2924f32567ffe925))

## [3.3.5](https://github.com/etienne-bechara/nestjs-core/compare/v3.3.4...v3.3.5) (2021-11-26)


### Bug Fixes

* bugfixes ([01967fd](https://github.com/etienne-bechara/nestjs-core/commit/01967fd51528c22dc7ffaac2df2fe7bbf2330a9b))

## [3.3.4](https://github.com/etienne-bechara/nestjs-core/compare/v3.3.3...v3.3.4) (2021-11-15)


### Bug Fixes

* upgrade configs ([68a4749](https://github.com/etienne-bechara/nestjs-core/commit/68a4749ee0efc4452e39bac73c5a3961913e19c6))

## [3.3.3](https://github.com/etienne-bechara/nestjs-core/compare/v3.3.2...v3.3.3) (2021-11-12)


### Bug Fixes

* lint fixes ([12d0f20](https://github.com/etienne-bechara/nestjs-core/commit/12d0f20631dac07d9108b5b6b42ffcf484912b53))
* logger transport level validation ([a7903db](https://github.com/etienne-bechara/nestjs-core/commit/a7903db3689ea32c09f8030f0245443b0d61243d))

## [3.3.2](https://github.com/etienne-bechara/nestjs-core/compare/v3.3.1...v3.3.2) (2021-11-12)


### Bug Fixes

* bump nestjs and sentry ([ac82760](https://github.com/etienne-bechara/nestjs-core/commit/ac82760fce2168c595ac14bae5158e973e35b984))

## [3.3.1](https://github.com/etienne-bechara/nestjs-core/compare/v3.3.0...v3.3.1) (2021-10-16)


### Bug Fixes

* remove source from packaging ([32c7b3f](https://github.com/etienne-bechara/nestjs-core/commit/32c7b3fc47e5275bf5621f0c03944e4c327cd5f3))

# [3.3.0](https://github.com/etienne-bechara/nestjs-core/compare/v3.2.2...v3.3.0) (2021-10-09)


### Bug Fixes

* rename request service to context service ([264fad7](https://github.com/etienne-bechara/nestjs-core/commit/264fad788bfbcaad609adae870ab6d5dca0bc16c))


### Features

* add encrypt and decrypt functionality to util ([b39846d](https://github.com/etienne-bechara/nestjs-core/commit/b39846da68ea2320a958121c96af297c543cdddd))

## [3.2.2](https://github.com/etienne-bechara/nestjs-core/compare/v3.2.1...v3.2.2) (2021-10-05)


### Bug Fixes

* allow instance to be provided on boot ([bffbcef](https://github.com/etienne-bechara/nestjs-core/commit/bffbcef9a704b71067f40c1eb91a45533892b8a0))
* bump deps ([7e58418](https://github.com/etienne-bechara/nestjs-core/commit/7e584189781d947e92c1699d951c0881d7866ff1))
* improve request metadata handling ([b64051d](https://github.com/etienne-bechara/nestjs-core/commit/b64051dd519ff016edacc46ac5687a74be5447e3))

## [3.2.1](https://github.com/etienne-bechara/nestjs-core/compare/v3.2.0...v3.2.1) (2021-09-22)


### Bug Fixes

* externalResponse to match got ([c629006](https://github.com/etienne-bechara/nestjs-core/commit/c629006c13e11b5fd98e1577bccfe2a9ed24ab15))

# [3.2.0](https://github.com/etienne-bechara/nestjs-core/compare/v3.1.4...v3.2.0) (2021-09-17)


### Features

* allow app compile without serving and refactor tests to use it ([e3f3a88](https://github.com/etienne-bechara/nestjs-core/commit/e3f3a881becd9ed7e0d19fdfc0ed0309743e85f6))
* bump nest to v8 ([f8d374f](https://github.com/etienne-bechara/nestjs-core/commit/f8d374f3301f6aeeeda74d188a72cebddfc5f675))

## [3.1.4](https://github.com/etienne-bechara/nestjs-core/compare/v3.1.3...v3.1.4) (2021-09-15)


### Bug Fixes

* slack size limit ([86d728e](https://github.com/etienne-bechara/nestjs-core/commit/86d728ebc42796af368cf8816f2acd6aca604f21))

## [3.1.3](https://github.com/etienne-bechara/nestjs-core/compare/v3.1.2...v3.1.3) (2021-09-13)


### Bug Fixes

* keep to string array default to only comma ([2dc2478](https://github.com/etienne-bechara/nestjs-core/commit/2dc2478b55cc3f7c64ff9e59c7ef8d778972587a))

## [3.1.2](https://github.com/etienne-bechara/nestjs-core/compare/v3.1.1...v3.1.2) (2021-08-30)


### Bug Fixes

* get client ip ([4241fb7](https://github.com/etienne-bechara/nestjs-core/commit/4241fb72ac694b9f98c084b786a12c5a24825a9a))

## [3.1.1](https://github.com/etienne-bechara/nestjs-core/compare/v3.1.0...v3.1.1) (2021-08-27)


### Bug Fixes

* lower server boot event log level ([a2891f0](https://github.com/etienne-bechara/nestjs-core/commit/a2891f089ffbf51aab92f84db166a80c28d31246))

# [3.1.0](https://github.com/etienne-bechara/nestjs-core/compare/v3.0.4...v3.1.0) (2021-08-06)


### Features

* add quick transform decorators ([1c79c09](https://github.com/etienne-bechara/nestjs-core/commit/1c79c09c62151fbb1cd791121386123a0e0216b4))

## [3.0.4](https://github.com/etienne-bechara/nestjs-core/compare/v3.0.3...v3.0.4) (2021-08-05)


### Bug Fixes

* remove auto-transform ([be11a65](https://github.com/etienne-bechara/nestjs-core/commit/be11a65237c5270e6b2e33ab66787cae9ba438db))

## [3.0.3](https://github.com/etienne-bechara/nestjs-core/compare/v3.0.2...v3.0.3) (2021-08-05)


### Bug Fixes

* http empty res and url logging ([8a58af7](https://github.com/etienne-bechara/nestjs-core/commit/8a58af79eaa82acc933ba225f5720ad18dc5cab1))

## [3.0.2](https://github.com/etienne-bechara/nestjs-core/compare/v3.0.1...v3.0.2) (2021-08-04)


### Bug Fixes

* improve config module definitions ([7e6dd3a](https://github.com/etienne-bechara/nestjs-core/commit/7e6dd3ab37e11a2c8f4dc7cc579b33b3aee046eb))

## [3.0.1](https://github.com/etienne-bechara/nestjs-core/compare/v3.0.0...v3.0.1) (2021-08-03)


### Bug Fixes

* slack integration ([ce778f8](https://github.com/etienne-bechara/nestjs-core/commit/ce778f8673a2a1ac660c697fb74d97529be3cb6c))

# [3.0.0](https://github.com/etienne-bechara/nestjs-core/compare/v2.8.1...v3.0.0) (2021-08-03)


### Bug Fixes

* remove chalk from dependencies ([c954dbb](https://github.com/etienne-bechara/nestjs-core/commit/c954dbb33de3b8f0fdb05beef9b47adad979d322))
* remove default adpter options ([e26b677](https://github.com/etienne-bechara/nestjs-core/commit/e26b6778763bdf7e217fafcfffabc1564ee105a9))


### Features

* add support for singleton request service through local storage ([459bd2d](https://github.com/etienne-bechara/nestjs-core/commit/459bd2df630abc15e4b584e60e447e63dac92750))


### BREAKING CHANGES

* add support for singleton request service through local storage

## [2.8.2](https://github.com/etienne-bechara/nestjs-core/compare/v2.8.1...v2.8.2) (2021-08-01)


### Bug Fixes

* remove default adpter options ([e26b677](https://github.com/etienne-bechara/nestjs-core/commit/e26b6778763bdf7e217fafcfffabc1564ee105a9))

## [2.8.1](https://github.com/etienne-bechara/nestjs-core/compare/v2.8.0...v2.8.1) (2021-07-31)


### Bug Fixes

* req metada usage ([c060b57](https://github.com/etienne-bechara/nestjs-core/commit/c060b57d82f89f933dd513356e18721d4352563c))

# [2.8.0](https://github.com/etienne-bechara/nestjs-core/compare/v2.7.1...v2.8.0) (2021-07-31)


### Features

* add request toolbox and remove global middleware ([da468c0](https://github.com/etienne-bechara/nestjs-core/commit/da468c053f1daad87aca26572578bc77b661afb6))

## [2.7.1](https://github.com/etienne-bechara/nestjs-core/compare/v2.7.0...v2.7.1) (2021-07-31)


### Bug Fixes

* metadata interface ([06cb1a8](https://github.com/etienne-bechara/nestjs-core/commit/06cb1a8d4721cb2c22d9172af86b956301a6e8cd))

# [2.7.0](https://github.com/etienne-bechara/nestjs-core/compare/v2.6.4...v2.7.0) (2021-07-31)


### Features

* replace express with fastify ([1bcbd32](https://github.com/etienne-bechara/nestjs-core/commit/1bcbd32f41619debc6213228ceb720dbf0be185b))

## [2.6.4](https://github.com/etienne-bechara/nestjs-core/compare/v2.6.3...v2.6.4) (2021-07-31)


### Bug Fixes

* add ignore exceptions and query merge ([06af3f8](https://github.com/etienne-bechara/nestjs-core/commit/06af3f81227a13c047fab1bb0deac2d32dbc0235))

## [2.6.3](https://github.com/etienne-bechara/nestjs-core/compare/v2.6.2...v2.6.3) (2021-07-31)


### Bug Fixes

* add custom query support ([bc355a8](https://github.com/etienne-bechara/nestjs-core/commit/bc355a892399856a322ccdcd2250375ba3d2092d))

## [2.6.2](https://github.com/etienne-bechara/nestjs-core/compare/v2.6.1...v2.6.2) (2021-07-31)


### Bug Fixes

* support search param array ([49e4b68](https://github.com/etienne-bechara/nestjs-core/commit/49e4b682e165db0f38e8d0acb4ce4ff284caa9ac))

## [2.6.1](https://github.com/etienne-bechara/nestjs-core/compare/v2.6.0...v2.6.1) (2021-07-30)


### Bug Fixes

* search params type ([9fb8cd9](https://github.com/etienne-bechara/nestjs-core/commit/9fb8cd951d709cdf9c78484a7e5fd49d7df3b923))

# [2.6.0](https://github.com/etienne-bechara/nestjs-core/compare/v2.5.1...v2.6.0) (2021-07-30)


### Bug Fixes

* direct cookie parsing ([a16fc24](https://github.com/etienne-bechara/nestjs-core/commit/a16fc2476348e20412506ea3a0e2100639eaea35))
* improve test module ([7d3c286](https://github.com/etienne-bechara/nestjs-core/commit/7d3c2866f400d08dd6fd6c66a323e3f8a831f5f7))


### Features

* replace axios with got ([a24149b](https://github.com/etienne-bechara/nestjs-core/commit/a24149b66765720191812b8f689ceed4f3c8201e))

## [2.5.1](https://github.com/etienne-bechara/nestjs-core/compare/v2.5.0...v2.5.1) (2021-07-09)


### Bug Fixes

* rollback to nestjs 7.x ([cebb077](https://github.com/etienne-bechara/nestjs-core/commit/cebb077a97b1c88759f514c3e9b7453d2c5a5815))

# [2.5.0](https://github.com/etienne-bechara/nestjs-core/compare/v2.4.1...v2.5.0) (2021-07-09)


### Features

* add transform utilities decorators ([6165363](https://github.com/etienne-bechara/nestjs-core/commit/6165363118126849d06d5640e7ca5d55e5ab360a))

## [2.4.1](https://github.com/etienne-bechara/nestjs-core/compare/v2.4.0...v2.4.1) (2021-07-09)


### Bug Fixes

* remove cache adapter ([1279c05](https://github.com/etienne-bechara/nestjs-core/commit/1279c058259b3623f19319cc778f9f2a4da4914b))

# [2.4.0](https://github.com/etienne-bechara/nestjs-core/compare/v2.3.9...v2.4.0) (2021-07-09)


### Bug Fixes

* remove jwt dependency ([c499a15](https://github.com/etienne-bechara/nestjs-core/commit/c499a154be34be5bbb6d1ed61ebded3e94dad0a8))
* remove uuid dep ([77f9c79](https://github.com/etienne-bechara/nestjs-core/commit/77f9c794d3761e5120d3e944030fe13121e89ab7))


### Features

* add overrides of all used deps ([9cc8661](https://github.com/etienne-bechara/nestjs-core/commit/9cc8661f7863bdee9b4a54e465938d602a9fcc02))
* bump core ([a98d121](https://github.com/etienne-bechara/nestjs-core/commit/a98d12100adc66558dbf64b705244eb63ba33189))

## [2.3.9](https://github.com/etienne-bechara/nestjs-core/compare/v2.3.8...v2.3.9) (2021-07-06)


### Bug Fixes

* bump deps ([489a099](https://github.com/etienne-bechara/nestjs-core/commit/489a099545f0fc1cb1ee0f2ecc09586946016f6b))

## [2.3.8](https://github.com/etienne-bechara/nestjs-core/compare/v2.3.7...v2.3.8) (2021-07-06)


### Bug Fixes

* standardize response ([68b4126](https://github.com/etienne-bechara/nestjs-core/commit/68b4126d2d8b3dc6b1b0fe6b5f919240b765593b))

## [2.3.7](https://github.com/etienne-bechara/nestjs-core/compare/v2.3.6...v2.3.7) (2021-06-26)


### Bug Fixes

* improve logger filtering ([cc2d155](https://github.com/etienne-bechara/nestjs-core/commit/cc2d155c2e58b292d6a4ff3d8275d25f3eaf0bf5))
* lint ([6bc643a](https://github.com/etienne-bechara/nestjs-core/commit/6bc643a44c74f88612d69ac282bc8b0a2fa02127))

## [2.3.6](https://github.com/etienne-bechara/nestjs-core/compare/v2.3.5...v2.3.6) (2021-06-25)


### Bug Fixes

* bump deps ([b1721dd](https://github.com/etienne-bechara/nestjs-core/commit/b1721dd6870531e2cf6c48dfde855181d667ea3a))

## [2.3.5](https://github.com/etienne-bechara/nestjs-core/compare/v2.3.4...v2.3.5) (2021-06-25)


### Bug Fixes

* **http:** restrict axios options ([5bb54a1](https://github.com/etienne-bechara/nestjs-core/commit/5bb54a1726d2ab94c89fa62396e724625dc69278))

## [2.3.4](https://github.com/etienne-bechara/nestjs-core/compare/v2.3.3...v2.3.4) (2021-06-16)


### Bug Fixes

* allow slack http to be silent ([7f329f8](https://github.com/etienne-bechara/nestjs-core/commit/7f329f8a0af3dda4807177090976f1a84703287c))

## [2.3.3](https://github.com/etienne-bechara/nestjs-core/compare/v2.3.2...v2.3.3) (2021-06-04)


### Bug Fixes

* add transform to validation pipe to prevent duplication ([e1697bb](https://github.com/etienne-bechara/nestjs-core/commit/e1697bb209a3016d9007e052d7d1d5866f96eb3f))
* response interface ([eb42d03](https://github.com/etienne-bechara/nestjs-core/commit/eb42d03a2ecca1df1f5dcfabf97a4988341c1482))

## [2.3.2](https://github.com/etienne-bechara/nestjs-core/compare/v2.3.1...v2.3.2) (2021-05-11)


### Bug Fixes

* add static method to acquire boot options ([746fd24](https://github.com/etienne-bechara/nestjs-core/commit/746fd24f53a3d75b0df2e0d42354cd257aad92f2))
* remove unnecessary injection ([e9194de](https://github.com/etienne-bechara/nestjs-core/commit/e9194de7fd44fea71880de9f1917a31f5099766b))

## [2.3.1](https://github.com/etienne-bechara/nestjs-core/compare/v2.3.0...v2.3.1) (2021-05-10)


### Bug Fixes

* boot options not injecting ([5124c56](https://github.com/etienne-bechara/nestjs-core/commit/5124c561b0b9a896a3fab22a58620e435c33911b))

# [2.3.0](https://github.com/etienne-bechara/nestjs-core/compare/v2.2.0...v2.3.0) (2021-05-09)


### Features

* allow choosing http exceptions to log as error ([c45efac](https://github.com/etienne-bechara/nestjs-core/commit/c45efac35b1de5737b9a623ac3c0f6ef714b2865))

# [2.2.0](https://github.com/etienne-bechara/nestjs-core/compare/v2.1.4...v2.2.0) (2021-05-08)


### Bug Fixes

* allow httpservice to be extended ([fcd9cfb](https://github.com/etienne-bechara/nestjs-core/commit/fcd9cfb41939ba7cf3bbcf5e23ffa5da21a554de))
* http interface ([ed50fd4](https://github.com/etienne-bechara/nestjs-core/commit/ed50fd4a856a1d2f4f9b4f214ead7d5b6e3e7c82))
* return nestApp on boot ([e31f059](https://github.com/etienne-bechara/nestjs-core/commit/e31f059658173fd4c7a712d5806c16a33d1f16b7))


### Features

* add true timeout to retryOnException() ([90fac8a](https://github.com/etienne-bechara/nestjs-core/commit/90fac8aceaa3dff46456c09e4cfd18e23ff55933))
* improve default cache configuration ([80b21ad](https://github.com/etienne-bechara/nestjs-core/commit/80b21ad7f5c0bc80ea7e8f69e15127615b95d0ec))

## [2.1.4](https://github.com/etienne-bechara/nestjs-core/compare/v2.1.3...v2.1.4) (2021-04-30)


### Bug Fixes

* bump rxjs to 7 ([f4e37fe](https://github.com/etienne-bechara/nestjs-core/commit/f4e37febad334bf2cdd494735a45e6c151ff2116))

## [2.1.3](https://github.com/etienne-bechara/nestjs-core/compare/v2.1.2...v2.1.3) (2021-04-28)


### Bug Fixes

* allow retry = 0 on retryOnException ([3317b06](https://github.com/etienne-bechara/nestjs-core/commit/3317b06dfe953cc93d48a1ac7ab4e103c7bb2c2b))

## [2.1.2](https://github.com/etienne-bechara/nestjs-core/compare/v2.1.1...v2.1.2) (2021-04-28)


### Bug Fixes

* remove express deps ([2b22add](https://github.com/etienne-bechara/nestjs-core/commit/2b22add41789b75d1dbbb681e3043c04cf8468ce))
* sleep and re-enable http tests ([371955b](https://github.com/etienne-bechara/nestjs-core/commit/371955bb62c0b49203c55d7069365b25be62a170))

## [2.1.1](https://github.com/etienne-bechara/nestjs-core/compare/v2.1.0...v2.1.1) (2021-04-23)


### Bug Fixes

* remove testing code ([a0496de](https://github.com/etienne-bechara/nestjs-core/commit/a0496de7f4ff3d1fb13d62d3f8b20283ecc909a0))

# [2.1.0](https://github.com/etienne-bechara/nestjs-core/compare/v2.0.19...v2.1.0) (2021-04-23)


### Features

* add trace and fatal log levels ([3871191](https://github.com/etienne-bechara/nestjs-core/commit/3871191f62090e9153927117283f5fe55f5e2c92))

## [2.0.19](https://github.com/etienne-bechara/nestjs-core/compare/v2.0.18...v2.0.19) (2021-04-23)


### Bug Fixes

* object not being decycled ([5b64ea9](https://github.com/etienne-bechara/nestjs-core/commit/5b64ea90945ca43fbc8bb0a83feb580b0b1b2360))

## [2.0.18](https://github.com/etienne-bechara/nestjs-core/compare/v2.0.17...v2.0.18) (2021-04-23)


### Bug Fixes

* improve logging of non-http errors ([8946904](https://github.com/etienne-bechara/nestjs-core/commit/89469042b44f86af63dee4d09b87f81b9c9fd016))

## [2.0.17](https://github.com/etienne-bechara/nestjs-core/compare/v2.0.16...v2.0.17) (2021-04-20)


### Bug Fixes

* semantic-release intallation ([2853dc2](https://github.com/etienne-bechara/nestjs-core/commit/2853dc2e39b63bd4322c4bec0a8f212519d7fd37))

## [2.0.16](https://github.com/etienne-bechara/nestjs-core/compare/v2.0.15...v2.0.16) (2021-04-19)


### Bug Fixes

* do not force pnpm ([d92fce4](https://github.com/etienne-bechara/nestjs-core/commit/d92fce46a04066353c275657b11d1dd4f39e7521))

## [2.0.15](https://github.com/etienne-bechara/nestjs-core/compare/v2.0.14...v2.0.15) (2021-04-19)


### Bug Fixes

* improve exception filter ([d24c0d2](https://github.com/etienne-bechara/nestjs-core/commit/d24c0d24a1c7143b3a3c302c3e13c7b94ac4017c))

## [2.0.14](https://github.com/etienne-bechara/nestjs-core/compare/v2.0.13...v2.0.14) (2021-04-17)


### Bug Fixes

* log transport looping ([d024ea9](https://github.com/etienne-bechara/nestjs-core/commit/d024ea97d3f3a7775a82b6baf49995c3382ecfd0))

## [2.0.13](https://github.com/etienne-bechara/nestjs-core/compare/v2.0.12...v2.0.13) (2021-04-17)


### Bug Fixes

* delay exit on validation error ([64445f7](https://github.com/etienne-bechara/nestjs-core/commit/64445f76e627c01925504127038eef081be546fc))

## [2.0.12](https://github.com/etienne-bechara/nestjs-core/compare/v2.0.11...v2.0.12) (2021-04-16)


### Bug Fixes

* lower default timeout to 60s ([4123599](https://github.com/etienne-bechara/nestjs-core/commit/4123599667b14e4c10018127aedd5c9be1c2b5a9))

## [2.0.11](https://github.com/etienne-bechara/nestjs-core/compare/v2.0.10...v2.0.11) (2021-04-10)


### Bug Fixes

* allow easier logger transport configuration by environment ([ea7f70b](https://github.com/etienne-bechara/nestjs-core/commit/ea7f70b252bf611e181720de971d45b53e366e37))
* move config not relevant by environment to boot ([d6c069d](https://github.com/etienne-bechara/nestjs-core/commit/d6c069d3a129be7decde98340f0fc826f3ad877d))
* npm deploy ([18c35dc](https://github.com/etienne-bechara/nestjs-core/commit/18c35dcb7d9bc74330ddc83bf1fd30a55da988d1))
* slack config not being preloaded ([04deddc](https://github.com/etienne-bechara/nestjs-core/commit/04deddcf973293f282a39ebc1dc3020d9ab02ef9))

## [2.0.11](https://github.com/etienne-bechara/nestjs-core/compare/v2.0.10...v2.0.11) (2021-04-10)


### Bug Fixes

* allow easier logger transport configuration by environment ([ea7f70b](https://github.com/etienne-bechara/nestjs-core/commit/ea7f70b252bf611e181720de971d45b53e366e37))
* move config not relevant by environment to boot ([d6c069d](https://github.com/etienne-bechara/nestjs-core/commit/d6c069d3a129be7decde98340f0fc826f3ad877d))
* slack config not being preloaded ([04deddc](https://github.com/etienne-bechara/nestjs-core/commit/04deddcf973293f282a39ebc1dc3020d9ab02ef9))

## [2.0.10](https://github.com/etienne-bechara/nestjs-core/compare/v2.0.9...v2.0.10) (2021-04-07)


### Bug Fixes

* logger sanitization ([0eb2f36](https://github.com/etienne-bechara/nestjs-core/commit/0eb2f36680ab4d091f593f0bb143759d88c8d24e))

## [2.0.9](https://github.com/etienne-bechara/nestjs-core/compare/v2.0.8...v2.0.9) (2021-04-07)


### Bug Fixes

* filter sensitive data when logging anything not just errors ([0181d08](https://github.com/etienne-bechara/nestjs-core/commit/0181d08d0f9e409b753d0c132719583a9c96df56))

## [2.0.8](https://github.com/etienne-bechara/nestjs-core/compare/v2.0.7...v2.0.8) (2021-04-06)


### Bug Fixes

* reverse module to prevent controller collision ([76fcab1](https://github.com/etienne-bechara/nestjs-core/commit/76fcab158f9cd978c59dd073c9c50dc874bd32c7))

## [2.0.7](https://github.com/etienne-bechara/nestjs-core/compare/v2.0.6...v2.0.7) (2021-04-03)


### Bug Fixes

* express dependency ([bd519b9](https://github.com/etienne-bechara/nestjs-core/commit/bd519b99533982ea9ca89bf711839af57ec7cd7c))

## [2.0.6](https://github.com/etienne-bechara/nestjs-core/compare/v2.0.5...v2.0.6) (2021-03-30)


### Bug Fixes

* allow custom request metadata ([648cbd5](https://github.com/etienne-bechara/nestjs-core/commit/648cbd5108911dd132d505d376dae07dadda3c20))

## [2.0.5](https://github.com/etienne-bechara/nestjs-core/compare/v2.0.4...v2.0.5) (2021-03-29)


### Bug Fixes

* add overrides and built-in nest dependencies ([1cb1f17](https://github.com/etienne-bechara/nestjs-core/commit/1cb1f1775e174c14095b2a00a50dbd9989278019))
* lock file ([7de7bd2](https://github.com/etienne-bechara/nestjs-core/commit/7de7bd25b08c3c953339af024edae2188a90bf00))
* override default http ([d8798ac](https://github.com/etienne-bechara/nestjs-core/commit/d8798ace3993db3dd4e3ff971f1e127905eedd46))
* update lock file ([ddcf684](https://github.com/etienne-bechara/nestjs-core/commit/ddcf68431f883f53b12e57e636ee03b31731f42b))

## [2.0.4](https://github.com/etienne-bechara/nestjs-core/compare/v2.0.3...v2.0.4) (2021-03-29)


### Bug Fixes

* remove snake_case outputs ([59f5764](https://github.com/etienne-bechara/nestjs-core/commit/59f57645ee4fc0d026d42acfa9e24f24aa440ecf))

## [2.0.3](https://github.com/etienne-bechara/nestjs-core/compare/v2.0.2...v2.0.3) (2021-03-27)


### Bug Fixes

* disallow automatic server ip acquisition ([e1c4b69](https://github.com/etienne-bechara/nestjs-core/commit/e1c4b69ee8d69e3d4ab90e9b87123c43d1f17498))

## [2.0.2](https://github.com/etienne-bechara/nestjs-core/compare/v2.0.1...v2.0.2) (2021-03-26)


### Bug Fixes

* **util:** store cached ip in service instead of adapter ([6ae5748](https://github.com/etienne-bechara/nestjs-core/commit/6ae57481adf9e5afa4ef8268af8fbbaaea627245))

## [2.0.1](https://github.com/etienne-bechara/nestjs-core/compare/v2.0.0...v2.0.1) (2021-03-26)


### Bug Fixes

* **https:** incorrect form encoded implementation ([26dffd3](https://github.com/etienne-bechara/nestjs-core/commit/26dffd32a8f3ae4e4090d85a9eba2e6923afa92c))

# [2.0.0](https://github.com/etienne-bechara/nestjs-core/compare/v1.5.2...v2.0.0) (2021-03-26)


### Features

* improve overall configuration and http logging ([5a0889a](https://github.com/etienne-bechara/nestjs-core/commit/5a0889a7fb6d408e68698f2d6886a4a1148b94a1))


### BREAKING CHANGES

* improve overall configuration and http logging

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
