export interface AsyncResolveParams<I, O> {
  data: I[];
  method: (d: I) => Promise<O>;
  limit: number;
}

export interface AsyncRetryParams<T> {
  method: () => Promise<T>;
  breakIf?: (e: any) => boolean;
  name?: string;
  retries?: number;
  timeout?: number;
  delay?: number;
}
