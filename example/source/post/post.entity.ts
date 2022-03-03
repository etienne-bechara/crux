import { IsNotEmpty, Min } from 'class-validator';

import { ToNumber } from '../../../source/transform/transform.decorator';
import { IsNumber, IsOptional, IsString } from '../../../source/validator/validator.decorator';

export class Post {

  @ToNumber()
  @IsNumber() @Min(1)
  public id: number;

  @IsNumber() @Min(1)
  public userId: number;

  @IsString() @IsNotEmpty()
  public title: string;

  @IsOptional()
  @IsString() @IsNotEmpty()
  public body?: string;

}
