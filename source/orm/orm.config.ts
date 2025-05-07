import { AppEnvironment } from '../app/app.enum';
import { Config, InjectConfig } from '../config/config.decorator';
import { IsBase64, IsEnum, IsNumberString, IsOptional, IsString } from '../validate/validate.decorator';

@Config()
export class OrmConfig {

  @IsOptional()
  @InjectConfig()
  @IsEnum(AppEnvironment)
  public readonly NODE_ENV?: AppEnvironment;

  @IsOptional()
  @InjectConfig()
  @IsString()
  public readonly ORM_HOST?: string;

  @IsOptional()
  @InjectConfig()
  @IsNumberString()
  public readonly ORM_PORT?: number;

  @IsOptional()
  @InjectConfig()
  @IsString()
  public readonly ORM_USERNAME?: string;

  @IsOptional()
  @InjectConfig()
  @IsString()
  public readonly ORM_PASSWORD?: string;

  @IsOptional()
  @InjectConfig()
  @IsString()
  public readonly ORM_DATABASE?: string;

  @IsOptional()
  @InjectConfig()
  @IsBase64()
  public readonly ORM_SERVER_CA?: string;

  @IsOptional()
  @InjectConfig()
  @IsBase64()
  public readonly ORM_CLIENT_CERTIFICATE?: string;

  @IsOptional()
  @InjectConfig()
  @IsBase64()
  public readonly ORM_CLIENT_KEY?: string;

}
