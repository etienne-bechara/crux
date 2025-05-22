import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';

@Controller()
@ApiExcludeController()
export class AppController {
	@Get()
	@HttpCode(HttpStatus.NO_CONTENT)
	public get(): void {
		return;
	}
}
