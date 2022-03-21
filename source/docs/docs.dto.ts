import { IsObject, IsString } from '../validator/validator.decorator';

export class DocsSpecification {

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
