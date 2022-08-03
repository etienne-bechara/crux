import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { validateSync, ValidationError } from 'class-validator';

import { ContextService } from '../context/context.service';

@Injectable()
export class AppValidator implements PipeTransform {

  public constructor(
    private readonly contextService: ContextService,
  ) { }

  /**
   * Validates request params, query and body based on provided class.
   * @param value
   * @param metadata
   */
  public transform(value: any, metadata: ArgumentMetadata): any {
    const { metatype } = metadata;
    const baseConstructors: any[] = [ String, Boolean, Number, Array, Object, Buffer ];
    if (!metatype || baseConstructors.includes(metatype)) return value;

    const options = this.contextService.getValidatorOptions();
    const instance: object = plainToInstance(metatype, value || { });
    const validationErrors = validateSync(instance, options);

    if (validationErrors.length > 0) {
      const constraints = validationErrors.flatMap((v) => this.getConstraints(v));
      throw new BadRequestException(constraints);
    }

    return instanceToPlain(instance);
  }

  /**
   * Given a validation error acquire all nested failed constraints.
   * @param validationError
   * @param prefix
   */
  private getConstraints(validationError: ValidationError, prefix = ''): string[] {
    const { children, constraints, property } = validationError;

    if (children?.length > 0) {
      prefix += `${property}.`;
      return children.flatMap((c) => this.getConstraints(c, prefix));
    }

    return Object.values(constraints || { }).map((c) => `${prefix}${c}`);
  }

}
