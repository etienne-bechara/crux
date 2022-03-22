export interface PromiseResolveParams<I, O> {
  data: I[];
  promise: (d: I) => Promise<O>;
  limit: number;
}

export interface PromiseRetryParams<T> {
  promise: () => Promise<T>;
  breakIf?: (e: any) => boolean;
  name?: string;
  retries?: number;
  timeout?: number;
  delay?: number;
}
