import { Config, InjectConfig } from '../config/config.decorator';
import { IsNotEmpty, IsOptional, IsString, IsUrl } from '../validate/validate.decorator';
import { ProfileOptions } from './profile.interface';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const PROFILE_DEFAULT_OPTIONS: ProfileOptions = { };

@Config()
export class ProfileConfig {

  @InjectConfig()
  @IsOptional()
  @IsUrl()
  public readonly PROFILE_URL: string;

  @InjectConfig()
  @IsOptional()
  @IsString() @IsNotEmpty()
  public readonly PROFILE_USERNAME: string;

  @InjectConfig()
  @IsOptional()
  @IsString() @IsNotEmpty()
  public readonly PROFILE_PASSWORD: string;

}
