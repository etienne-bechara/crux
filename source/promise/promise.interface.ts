export interface PromiseResolveOrTimeoutParams<T> {
  timeout: number;
  promise: () => Promise<T>;
}

export interface PromiseResolveLimitedParams<I, O> {
  data: I[];
  promise: (d: I) => Promise<O>;
  limit: number;
}

export interface PromiseResolveDeduplicatedParams<T> {
  key: string;
  timeout?: number;
  delay?: number;
  promise: () => Promise<T>;
}

export interface PromiseRetryParams<T> {
  promise: () => Promise<T>;
  breakIf?: (e: any) => boolean;
  name?: string;
  retries?: number;
  timeout?: number;
  delay?: number;
}
