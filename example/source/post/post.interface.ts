import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

import { ToNumber } from '../../../source/transform/transform.decorator';

export class Post {

  @ApiProperty()
  @ToNumber()
  @IsNumber() @Min(1)
  public id: number;

  @ApiProperty()
  @IsNumber() @Min(1)
  public userId: number;

  @ApiProperty()
  @IsString() @IsNotEmpty()
  public title: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString() @IsNotEmpty()
  public body?: string;

}
