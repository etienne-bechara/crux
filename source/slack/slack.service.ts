import { Injectable } from '@nestjs/common';

import { AppConfig } from '../app/app.config';
import { AppEnvironment } from '../app/app.enum';
import { HttpService } from '../http/http.service';
import { LogException, LogSeverity, LogTransportName } from '../log/log.enum';
import { LogParams, LogTransport } from '../log/log.interface';
import { LogService } from '../log/log.service';
import { SlackConfig } from './slack.config';

@Injectable()
export class SlackService implements LogTransport {

  public constructor(
    private readonly appConfig: AppConfig,
    private readonly httpService: HttpService,
    private readonly logService: LogService,
    private readonly slackConfig: SlackConfig,
  ) {
    this.setupTransport();
  }

  /**
   * Checks if necessary variables are present and warn through console if not.
   */
  private setupTransport(): void {
    const { slack } = this.appConfig.APP_OPTIONS || { };
    const { webhook } = slack;
    const slackWebhook = this.slackConfig.SLACK_WEBHOOK || webhook;

    if (!slackWebhook) {
      this.logService.info('Slack transport disabled due to missing webhook');
      return;
    }

    const webhookId = slackWebhook.split('/')[slackWebhook.split('/').length - 1];
    this.logService.info(`Slack transport connected at ${webhookId}`);

    this.logService.registerTransport(this);
  }

  /**
   * Acquires this transport name.
   */
  public getName(): LogTransportName {
    return LogTransportName.SENTRY;
  }

  /**
   * Returns minimum level for logging this transport.
   */
  public getSeverity(): LogSeverity {
    const { slack } = this.appConfig.APP_OPTIONS || { };
    const { severity } = slack;
    return this.slackConfig.SLACK_SEVERITY || severity;
  }

  /**
   * Sends a log message to Slack configuring custom data and labels.
   * In case of failure it may lead to infinite loop, so check recursion.
   * @param params
   */
  public log(params: LogParams): void {
    const environment = this.appConfig.NODE_ENV;
    const { severity, requestId, caller, message, data } = params;

    const maxCharacters = 3000;
    const separator = '  |  ';

    let slackMsg = `*${this.getSlackEnvironment(environment)}*${separator}`
      + `*${this.getSlackSeverity(severity)}*${separator}`
      + `${requestId ? `*${requestId.slice(0, 6)}*${separator}` : ''}`
      + `${caller}${separator}${message}`;

    if (data) {
      const details = JSON.stringify(data);

      const trimmedDetails = details.length + slackMsg.length >= maxCharacters
        ? `${details.slice(0, maxCharacters - 100 - slackMsg.length)}\n\n[...]`
        : details;

      const beatifyUrl = encodeURI(`https://codebeautify.org/jsonviewer?input=${trimmedDetails}`);
      const normalizedUrl = beatifyUrl.replace(/[#&]+/g, '');

      slackMsg = slackMsg.replace(message, `<${normalizedUrl}|${message}>`);
    }

    void this.publishSlackMessage(slackMsg);
  }

  /**
   * Publishes a message formatted as Slack blocks.
   * @param message
   */
  public async publishSlackMessage(message: string): Promise<void> {
    try {
      await this.httpService.post('', {
        json: {
          blocks: [
            {
              type: 'context',
              elements: [ { type: 'mrkdwn', text: message } ],
            },
          ],
        },
      });
    }
    catch (e) {
      this.logService.warning(LogException.PUBLISH_FAILED, e as Error, { message });
    }
  }

  /**
   * Translates application environment into Slack environment label.
   * @param environment
   */
  public getSlackEnvironment(environment: AppEnvironment): string {
    switch (environment) {
      case AppEnvironment.PRODUCTION: return '🔴 Production';
      case AppEnvironment.STAGING: return '🟠 Staging';
      case AppEnvironment.DEVELOPMENT: return '🟡 Development';
      case AppEnvironment.LOCAL: return '🟢 Local';
      case AppEnvironment.TEST: return '⚪ Test';
    }
  }

  /**
   * Translates application log level into Slack severity label.
   * @param severity
   */
  public getSlackSeverity(severity: LogSeverity): string {
    switch (severity) {
      case LogSeverity.FATAL: return '💀 Fatal';
      case LogSeverity.ERROR: return '🚨 Error';
      case LogSeverity.WARNING: return '⚠️ Warning';
      case LogSeverity.NOTICE: return '✔️ Notice';
      case LogSeverity.INFO: return 'ⓘ Info';
      case LogSeverity.HTTP: return '🌐 Http';
      case LogSeverity.DEBUG: return '🐞 Debug';
      case LogSeverity.TRACE: return '🐜 Trace';
    }
  }

}
