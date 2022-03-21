import { IsObject, IsString } from '../validate/validate.decorator';

export class DocSpecification {

  @IsString()
  public openapi: string;

  @IsObject()
  public paths: Record<string, any>;

  @IsObject()
  public info: Record<string, any>;

  @IsString({ each: true })
  public tags: string[];

  @IsString({ each: true })
  public servers: string[];

  @IsObject()
  public components: Record<string, any>;

}
