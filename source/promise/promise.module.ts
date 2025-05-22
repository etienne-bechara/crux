import { Module } from '@nestjs/common';

import { PromiseService } from './promise.service';

@Module({
	providers: [PromiseService],
	exports: [PromiseService],
})
export class PromiseModule {}
