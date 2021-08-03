/* eslint-disable @typescript-eslint/naming-convention */
import { AsyncLocalStorage } from 'async_hooks';

export const RequestStorage = new AsyncLocalStorage<Map<string, any>>();
