import { Injectable } from '@nestjs/common';
import { compress } from 'snappy';

import { AppConfig } from '../app/app.config';
import { HttpService } from '../http/http.service';
import { LogException, LogSeverity, LogTransportName } from '../log/log.enum';
import { LogParams, LogTransport } from '../log/log.interface';
import { LogService } from '../log/log.service';
import { LokiConfig } from './loki.config';
import { LokiEntry, LokiMessage, LokiStream } from './loki.interface';
import { LokiMessageProto } from './loki.proto';

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
  private buildLokiUrl(): string {
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

    const lokiUrl = this.buildLokiUrl();
    const logs = [ ...this.publishQueue ];
    this.publishQueue = [ ];

    const messageData = this.buildLokiMessage(logs);
    const message = new LokiMessageProto(messageData);
    const buffer: Buffer = LokiMessageProto.encode(message).finish() as any;

    try {
      await this.httpService.post(lokiUrl, {
        headers: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'content-type': 'application/vnd.google.protobuf',
        },
        body: await compress(buffer),
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

    for (const log of logs) {
      streams.push({
        labels: this.buildLokiLabels(log),
        entries: this.buildLokiEntries(log),
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
   * Build Loki labels which consists of a string in
   * custom format.
   * @param log
   */
  private buildLokiLabels(log: LogParams): string {
    const { name: job, instance } = this.appConfig.APP_OPTIONS;
    const environment = this.appConfig.NODE_ENV;
    const { severity } = log;
    const level = this.getLokiLevel(severity);

    const labelsObj = { job, instance, environment };
    let labelsStr = `level="${level}"`;

    for (const key in labelsObj) {
      labelsStr += `,${key}="${labelsObj[key]}"`;
    }

    return `{${labelsStr}}`;
  }

  /**
   * Build Loki entries which consists of a timestamp
   * with ns precision and a log line.
   * @param log
   */
  private buildLokiEntries(log: LogParams): LokiEntry[] {
    const { timestamp, message, caller, requestId, traceId, spanId, data } = log;
    const timeMs = new Date(timestamp).getTime();

    const entry: LokiEntry = {
      line: JSON.stringify({ message, caller, requestId, traceId, spanId, data }),
      timestamp: {
        seconds: timeMs / 1000,
        nanos: timeMs % 1000 * 1e6,
      },
    };

    return [ entry ];
  }

}
