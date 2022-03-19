import { Injectable } from '@nestjs/common';

import { AppConfig } from '../app/app.config';
import { HttpService } from '../http/http.service';
import { LoggerSeverity } from '../logger/logger.enum';
import { LoggerParams, LoggerTransport } from '../logger/logger.interface';
import { LoggerService } from '../logger/logger.service';
import { LokiConfig } from './loki.config';
import { LokiPushStream } from './loki.interface';

@Injectable()
export class LokiService implements LoggerTransport {

  private publishQueue: LoggerParams[] = [ ];
  private publishLast: Date;

  public constructor(
    private readonly appConfig: AppConfig,
    private readonly httpService: HttpService,
    private readonly loggerService: LoggerService,
    private readonly lokiConfig: LokiConfig,
  ) {
    this.setupTransport();
  }

  /**
   * Checks if necessary variables are present and warn through console if not.
   */
  private setupTransport(): void {
    const { logger } = this.appConfig.APP_OPTIONS || { };
    const url = this.lokiConfig.LOKI_URL || logger.lokiUrl;

    if (!url) {
      this.loggerService.info('Loki transport disabled due to missing url');
      return;
    }

    this.loggerService.info(`Loki transport connected at ${url}`);
    this.loggerService.registerTransport(this);
  }

  /**
   * Returns minimum level for logging this transport.
   */
  public getSeverity(): LoggerSeverity {
    const { logger } = this.appConfig.APP_OPTIONS || { };
    return this.lokiConfig.LOKI_SEVERITY || logger.lokiSeverity;
  }

  /**
   * Orchestrates pushing log batches to Loki, triggering a push at configured
   * interval or if target batch size is met.
   * @param params
   */
  public log(params: LoggerParams): void {
    const { message } = params;
    if (message === this.lokiConfig.LOKI_EXCEPTION_MESSAGE) return;

    const { logger } = this.appConfig.APP_OPTIONS || { };
    const { lokiBatchSize } = logger;

    this.publishQueue.push(params);

    if (this.publishQueue.length >= lokiBatchSize) {
      void this.publishCurrentQueue();
    }
  }

  /**
   * Reads current queue and publish it as a batch at Loki API,
   * split the streams by severity and label them accordingly.
   */
  private async publishCurrentQueue(): Promise<void> {
    const logs = [ ...this.publishQueue ];
    this.publishQueue = [ ];

    const streams = this.buildPushStream(logs);

    try {
      await this.httpService.post('loki/api/v1/push', {
        json: { streams },
        retryLimit: 2,
      });
    }
    catch (e) {
      this.loggerService.warning(this.lokiConfig.LOKI_EXCEPTION_MESSAGE, e as Error);
    }
  }

  /**
   * Given a set of logs, constructs the payload expected by Loki API.
   * @param logs
   */
  private buildPushStream(logs: LoggerParams[]): LokiPushStream[] {
    const { job, instance } = this.appConfig.APP_OPTIONS;
    const pushStreams: LokiPushStream[] = [ ];
    const environment = this.appConfig.NODE_ENV;

    for (const severity of Object.values(LoggerSeverity)) {
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
  private getLokiLevel(severity: LoggerSeverity): string {
    return severity === LoggerSeverity.HTTP
      ? 'info'
      : severity;
  }

  /**
   * Given a set of logs, constructs the log payload into following forma:
   * [ '<unix epoch in nanoseconds>', '<log line>' ].
   * @param logs
   */
  private buildPushStreamValues(logs: LoggerParams[]): string[][] {
    const streamValues: string[][] = [ ];

    for (const log of logs) {
      const { timestamp, requestId, caller, message, data } = log;
      const unixNanoseconds = new Date(timestamp).getTime() * 10 ** 6;

      streamValues.push([
        unixNanoseconds.toString(),
        JSON.stringify({ requestId, caller, message, data }),
      ]);
    }

    return streamValues;
  }

}
