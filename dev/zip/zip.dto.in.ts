import { ApiProperty, IsNumberString, Length } from '../../source/override';

export class ZipReadDto {

  @IsNumberString()
  @Length(8, 8)
  @ApiProperty({
    example: '04567000',
  })
  public code: string;

}
