import { Injectable } from '@nestjs/common';

import { AppConfig } from '../app/app.config';
import { HttpService } from '../http/http.service';
import { LogException, LogSeverity, LogTransportName } from '../log/log.enum';
import { LogParams, LogTransport } from '../log/log.interface';
import { LogService } from '../log/log.service';
import { LokiConfig } from './loki.config';
import { LokiMessage, LokiStream } from './loki.interface';

@Injectable()
export class LokiService implements LogTransport {

  private publishQueue: LogParams[] = [ ];

  public constructor(
    private readonly appConfig: AppConfig,
    private readonly httpService: HttpService,
    private readonly logService: LogService,
    private readonly lokiConfig: LokiConfig,
  ) {
    this.setupTransport();
  }

  /**
   * Acquires configured Loki URL giving priority to environment variable.
   */
  private buildLokiUrl(): string | undefined {
    const { loki } = this.appConfig.APP_OPTIONS || { };
    const { url } = loki;
    return this.lokiConfig.LOKI_URL || url;
  }

  /**
   * Checks if necessary variables are present and warn through console if not.
   */
  private setupTransport(): void {
    const lokiUrl = this.buildLokiUrl();

    if (!lokiUrl) {
      this.logService.info('Loki transport disabled due to missing URL');
      return;
    }

    this.logService.info(`Loki transport connected at ${lokiUrl}`);
    this.logService.registerTransport(this);

    void this.setupPush();
  }

  /**
   * Acquires this transport name.
   */
  public getName(): LogTransportName {
    return LogTransportName.LOKI;
  }

  /**
   * Returns minimum level for logging this transport.
   */
  public getSeverity(): LogSeverity {
    const { loki } = this.appConfig.APP_OPTIONS || { };
    const { severity } = loki;
    return this.lokiConfig.LOKI_SEVERITY || severity;
  }

  /**
   * Orchestrates pushing log batches to Loki, triggering a push at configured
   * interval or if target batch size is met.
   * @param params
   */
  public log(params: LogParams): void {
    const { loki } = this.appConfig.APP_OPTIONS || { };
    const { batchSize } = loki;

    this.publishQueue.push(params);

    if (this.publishQueue.length >= batchSize) {
      void this.publishCurrentQueue();
    }
  }

  /**
   * Publish logs once at every configured interval.
   */
  private async setupPush(): Promise<void> {
    const { loki } = this.appConfig.APP_OPTIONS || { };
    const { pushInterval } = loki;
    if (!pushInterval) return;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      await new Promise((r) => setTimeout(r, pushInterval));
      void this.publishCurrentQueue();
    }
  }

  /**
   * Reads current queue and publish it as a batch at Loki API,
   * compress the payload as gzip in order to minimize body size.
   */
  private async publishCurrentQueue(): Promise<void> {
    if (this.publishQueue.length === 0) return;

    const lokiUrl = this.buildLokiUrl() as string;
    const logs = [ ...this.publishQueue ];
    this.publishQueue = [ ];

    const messageData = this.buildLokiMessage(logs);

    try {
      await this.httpService.post(lokiUrl, {
        json: messageData,
        retryLimit: 2,
      });
    }
    catch (e) {
      this.logService.error(LogException.PUSH_FAILED, e as Error);
    }
  }

  /**
   * Given a set of logs, constructs the payload expected by Loki API,
   * split the streams by severity and label them accordingly.
   * @param logs
   */
  private buildLokiMessage(logs: LogParams[]): LokiMessage {
    const streams: LokiStream[] = [ ];

    for (const severity of Object.values(LogSeverity)) {
      const matchingLogs = logs.filter((l) => l.severity === severity);
      if (matchingLogs.length === 0) continue;

      streams.push({
        stream: {
          ...this.buildLokiLabels(),
          level: this.getLokiLevel(severity),
        },
        values: this.buildLokiEntries(matchingLogs),
      });
    }

    return { streams };
  }

  /**
   * Translates application severity into a standard recognized
   * by Grafana Loki Explorer.
   * @param severity
   */
  private getLokiLevel(severity: LogSeverity): string {
    return severity === LogSeverity.HTTP
      ? 'info'
      : severity;
  }

  /**
   * Build Loki labels.
   */
  private buildLokiLabels(): Record<string, string> {
    const { name: job, instance } = this.appConfig.APP_OPTIONS;
    const environment = this.appConfig.NODE_ENV;
    return { job, instance, environment };
  }

  /**
   * Build Loki entries which consists of a timestamp
   * with ns precision and a log line.
   * @param logs
   */
  private buildLokiEntries(logs: LogParams[]): string[][] {
    return logs.map((l) => {
      const { timestamp, message, caller, requestId, traceId, spanId, data } = l;
      const timeMs = new Date(timestamp).getTime();
      const line = JSON.stringify({ message, caller, requestId, traceId, spanId, data });
      return [ String(timeMs * 1_000_000), line ];
    });
  }

}
