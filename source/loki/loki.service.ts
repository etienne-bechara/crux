import { Injectable } from '@nestjs/common';
import zlib from 'zlib';

import { AppConfig } from '../app/app.config';
import { HttpService } from '../http/http.service';
import { LogException, LogSeverity, LogTransportName } from '../log/log.enum';
import { LogParams, LogTransport } from '../log/log.interface';
import { LogService } from '../log/log.service';
import { LokiConfig } from './loki.config';
import { LokiPushStream } from './loki.interface';

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

    const streams = this.buildPushStream(logs);
    const buffer = Buffer.from(JSON.stringify({ streams }));

    try {
      const gzip: Buffer = await new Promise((res, rej) => zlib.gzip(buffer, (e, d) => e ? rej(e) : res(d)));

      await this.httpService.post(lokiUrl, {
        headers: {
          'content-type': 'application/json', // eslint-disable-line @typescript-eslint/naming-convention
          'content-encoding': 'gzip', // eslint-disable-line @typescript-eslint/naming-convention
        },
        body: gzip,
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
  private buildPushStream(logs: LogParams[]): LokiPushStream[] {
    const { job, instance } = this.appConfig.APP_OPTIONS;
    const pushStreams: LokiPushStream[] = [ ];
    const environment = this.appConfig.NODE_ENV;

    for (const severity of Object.values(LogSeverity)) {
      const matchingLogs = logs.filter((l) => l.severity === severity);
      if (matchingLogs.length === 0) continue;

      const level = this.getLokiLevel(severity);

      pushStreams.push({
        stream: { job, instance, environment, level },
        values: this.buildPushStreamValues(matchingLogs),
      });
    }

    return pushStreams;
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
   * Given a set of logs, constructs the log payload into following forma:
   * [ '<unix epoch in nanoseconds>', '<log line>' ].
   * @param logs
   */
  private buildPushStreamValues(logs: LogParams[]): string[][] {
    const streamValues: string[][] = [ ];

    for (const log of logs) {
      const { timestamp, caller, message, requestId, traceId, spanId, data } = log;
      const unixNanoseconds = new Date(timestamp).getTime() * 10 ** 6;

      streamValues.push([
        unixNanoseconds.toString(),
        JSON.stringify({ caller, message, requestId, traceId, spanId, data }),
      ]);
    }

    return streamValues;
  }

}
