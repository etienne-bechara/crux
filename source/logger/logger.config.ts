import { Injectable } from '@nestjs/common';
import { IsIn } from 'class-validator';

import { AppEnvironment } from '../app/app.enum';
import { InjectSecret } from '../config/config.decorator';

@Injectable()
export class LoggerConfig {

  @InjectSecret()
  @IsIn(Object.values(AppEnvironment))
  public readonly NODE_ENV: AppEnvironment;

}
