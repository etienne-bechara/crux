import { AppRequest, AppResponse } from '../../app/app.interface';

export interface RequestHttpContext {
  req: AppRequest;
  res: AppResponse;
  next: any;
}
