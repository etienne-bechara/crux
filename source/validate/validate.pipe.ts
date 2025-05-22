import { Injectable, PipeTransform, ValidationPipe } from '@nestjs/common';
import { ValidationError } from 'class-validator';

import { AppConfig } from '../app/app.config';
import { ContextService } from '../context/context.service';
import { TraceService } from '../trace/trace.service';
import { VALIDATE_REQUEST_DEFAULT_OPTIONS } from './validate.config';

@Injectable()
export class ValidatePipe extends ValidationPipe implements PipeTransform {
  public constructor(
    private readonly appConfig: AppConfig,
    private readonly contextService: ContextService,
  ) {
    super(VALIDATE_REQUEST_DEFAULT_OPTIONS);
  }

  /**
   * Overwrite behaviour of built in NestJS validator by allowing
   * dynamically acquired options from context and adding tracing.
   * @param object
   */
  protected validate(object: object): Promise<ValidationError[]> | ValidationError[] {
    const defaultOptions = this.appConfig.APP_OPTIONS.validator?.request || {};
    const options = this.contextService.getValidatorOptions() || defaultOptions;
    return TraceService.startManagedSpan('App | Validation Pipe', {}, () => super.validate(object, options));
  }
}
