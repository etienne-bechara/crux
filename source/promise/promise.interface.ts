export interface PromiseResolveOrTimeoutParams<T> {
  /** Underlying operation to run. */
  promise: () => Promise<T>;
  /** Underlying operation timeout in milliseconds. Default: 95% of application timeout. */
  timeout?: number;
  /** Timeout error message, thrown along a 500 exception. */
  timeoutMessage?: string;
}

export interface PromiseResolveLimitedParams<I, O> {
  /** Array of underlying operation input parameters. */
  data: I[];
  /** Underlying operation to run, receiving data item as input parameter. */
  promise: (d: I) => Promise<O>;
  /** Maximum concurrency. */
  limit: number;
}

export interface PromiseResolveDedupedParams<T> extends PromiseResolveOrTimeoutParams<T> {
  /** Unique key to identify the underlying running operation. */
  key: string;
  /** Dedupe data time to live in milliseconds. Default: 60s. */
  ttl?: number;
  /** Wait time between checking if deduped data is available. Default: 1s. */
  delay?: number;
}

export interface PromiseRetryParams<T> {
  promise: () => Promise<T>;
  breakIf?: (e: any) => boolean;
  name?: string;
  retries?: number;
  timeout?: number;
  delay?: number;
}
