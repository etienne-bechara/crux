import { Injectable, PipeTransform, ValidationPipe } from '@nestjs/common';
import { ValidationError } from 'class-validator';

import { ContextService } from '../context/context.service';

@Injectable()
export class ValidatePipe extends ValidationPipe implements PipeTransform {

  public constructor(
    private readonly contextService: ContextService,
  ) {
    super({ transform: true });
  }

  /**
   * Overwrite behaviour of built in NestJS validator by allowing
   * dynamically acquired options from context.
   * @param object
   */
  protected validate(object: object): Promise<ValidationError[]> | ValidationError[] {
    const options = this.contextService.getValidatorOptions();
    return super.validate(object, options);
  }

}
