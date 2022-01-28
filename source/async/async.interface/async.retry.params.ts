export interface AsyncRetryParams<T> {
  method: () => Promise<T>;
  breakIf?: (e: any) => boolean;
  name?: string;
  retries?: number;
  timeout?: number;
  delay?: number;
}
