import { IsString } from 'class-validator';
import { IsBuffer } from '../../source/validate/validate.decorator';

export class RandomFileCreateDto {
	@IsBuffer()
	public file!: Buffer;

	@IsString()
	public filename!: string;
}
