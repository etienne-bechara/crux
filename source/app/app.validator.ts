import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validateSync, ValidationError } from 'class-validator';

import { ContextService } from '../context/context.service';
import { AppConfig } from './app.config';

@Injectable()
export class AppValidator implements PipeTransform {

  public constructor(
    private readonly appConfig: AppConfig,
    private readonly contextService: ContextService,
  ) { }

  /**
   * Validates request params, query and body based on provided class.
   * @param value
   * @param metadata
   */
  public transform(value: any, metadata: ArgumentMetadata): void {
    const { metatype } = metadata;
    const options = this.appConfig.APP_OPTIONS.validator;

    const validationErrors = validateSync(plainToClass(metatype, value) as object, options);

    if (validationErrors.length > 0) {
      const constraints = validationErrors.flatMap((v) => this.getConstraints(v));
      throw new BadRequestException(constraints);
    }
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
