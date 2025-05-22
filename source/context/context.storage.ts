import { AsyncLocalStorage } from 'node:async_hooks';

export const ContextStorage = new AsyncLocalStorage<Map<string, any>>();
