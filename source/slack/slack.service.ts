import { Injectable } from '@nestjs/common';

import { AppConfig } from '../app/app.config';
import { AppEnvironment } from '../app/app.enum';
import { HttpService } from '../http/http.service';
import { LoggerSeverity } from '../logger/logger.enum';
import { LoggerParams, LoggerTransport } from '../logger/logger.interface';
import { LoggerService } from '../logger/logger.service';
import { SlackConfig } from './slack.config';

@Injectable()
export class SlackService implements LoggerTransport {

  public constructor(
    private readonly appConfig: AppConfig,
    private readonly httpService: HttpService,
    private readonly loggerService: LoggerService,
    private readonly slackConfig: SlackConfig,
  ) {
    this.setupTransport();
  }

  /**
   * Checks if necessary variables are present and warn through console if not.
   */
  private setupTransport(): void {
    const { logger } = this.appConfig.APP_OPTIONS || { };
    const webhook = this.slackConfig.SLACK_WEBHOOK || logger.slackWebhook;

    if (!webhook) {
      this.loggerService.info('Slack transport disabled due to missing webhook');
      return;
    }

    const webhookId = webhook.split('/')[webhook.split('/').length - 1];
    this.loggerService.info(`Slack transport connected at ${webhookId}`);

    this.loggerService.registerTransport(this);
  }

  /**
   * Returns minimum level for logging this transport.
   */
  public getSeverity(): LoggerSeverity {
    const { logger } = this.appConfig.APP_OPTIONS || { };
    return this.slackConfig.SLACK_SEVERITY || logger.slackSeverity;
  }

  /**
   * Sends a log message to Slack configuring custom data and labels.
   * In case of failure it may lead to infinite loop, so check recursion.
   * @param params
   */
  public log(params: LoggerParams): void {
    const { environment, severity, requestId, caller, message, data } = params;
    if (data?.messageBlocks || message === this.slackConfig.SLACK_EXCEPTION_MESSAGE) return;

    const maxCharacters = 3000;
    const separator = '  |  ';

    let slackMsg = `*${this.getSlackEnvironment(environment)}*${separator}`
      + `*${this.getSlackSeverity(severity)}*${separator}`
      + `${requestId ? `*${requestId}*${separator}` : ''}`
      + `${caller}${separator}${message}`;

    if (data) {
      const details = JSON.stringify(data);

      const trimmedDetails = details.length + slackMsg.length >= maxCharacters
        ? `${details.slice(0, maxCharacters - 100 - slackMsg.length)}\n\n[...]`
        : details;

      const beatifyUrl = encodeURI(`https://codebeautify.org/jsonviewer?input=${trimmedDetails}`);
      slackMsg = slackMsg.replace(message, `<${beatifyUrl}|${message}>`);
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
      this.loggerService.warning(this.slackConfig.SLACK_EXCEPTION_MESSAGE, e as Error, { message });
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
  public getSlackSeverity(severity: LoggerSeverity): string {
    switch (severity) {
      case LoggerSeverity.FATAL: return '💀 Fatal';
      case LoggerSeverity.ERROR: return '🚨 Error';
      case LoggerSeverity.WARNING: return '⚠️ Warning';
      case LoggerSeverity.NOTICE: return '✔️ Notice';
      case LoggerSeverity.INFO: return 'ⓘ Info';
      case LoggerSeverity.HTTP: return '🌐 Http';
      case LoggerSeverity.DEBUG: return '🐞 Debug';
      case LoggerSeverity.TRACE: return '🐜 Trace';
    }
  }

}
