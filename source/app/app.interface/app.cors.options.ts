import { CorsOptions, CustomOrigin } from '@nestjs/common/interfaces/external/cors-options.interface';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class AppCorsOptions implements CorsOptions {

  @IsOptional()
  public origin?: boolean | string | RegExp | (string | RegExp)[] | CustomOrigin;

  @IsOptional()
  @IsString()
  public methods?: string | string[];

  @IsOptional()
  @IsString()
  public allowedHeaders?: string | string[];

  @IsOptional()
  @IsString()
  public exposedHeaders?: string | string[];

  @IsOptional()
  @IsBoolean()
  public credentials?: boolean;

  @IsOptional()
  @IsNumber()
  public maxAge?: number;

  @IsOptional()
  @IsBoolean()
  public preflightContinue?: boolean;

  @IsOptional()
  @IsNumber()
  public optionsSuccessStatus?: number;

}
