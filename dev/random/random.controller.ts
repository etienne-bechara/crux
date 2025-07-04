import { BadRequestException, Body, Controller, Get, Param, Post } from '../../source/override';
import { RandomFileCreateDto } from './random.dto.in';
import { RandomService } from './random.service';

@Controller('random')
export class RandomController {
	public constructor(private readonly randomService: RandomService) {}

	@Get()
	public getRandom(): Promise<any> {
		return this.randomService.doRandom();
	}

	@Get(':amount')
	public getRandomSplit(@Param('amount') amount: string): Promise<any> {
		const numericAmount = Number(amount);

		if (!numericAmount) {
			throw new BadRequestException('amount must be a number');
		}

		return this.randomService.doRandomSplit(numericAmount);
	}

	@Post('file')
	public postRandomFile(@Body() body: RandomFileCreateDto): Buffer {
		return body.file;
	}
}
