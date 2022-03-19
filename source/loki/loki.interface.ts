export interface LokiPushParams {
  streams: LokiPushStream[];
}

export interface LokiPushStream {
  stream: Record<string, string>;
  values: string[][];
}
