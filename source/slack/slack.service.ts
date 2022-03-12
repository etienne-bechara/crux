import { Injectable } from '@nestjs/common';

import { AppEnvironment } from '../app/app.enum';
import { HttpService } from '../http/http.service';
import { LoggerLevel } from '../logger/logger.enum';
import { LoggerParams, LoggerTransport } from '../logger/logger.interface';
import { LoggerService } from '../logger/logger.service';
import { SlackConfig } from './slack.config';

@Injectable()
export class SlackService implements LoggerTransport {

  private exceptionMessage = 'Failed to publish slack message';

  public constructor(
    private readonly slackConfig: SlackConfig,
    private readonly loggerService: LoggerService,
    private readonly httpService: HttpService,
  ) {
    this.setupTransport();
  }

  /**
   * Checks if necessary variables are present and warn through console if not.
   */
  private setupTransport(): void {
    const webhook = this.slackConfig.SLACK_WEBHOOK;
    const level = this.getLevel();
    if (!level) return;

    if (!webhook) {
      return this.loggerService.warning('Integration disabled due to missing webhook');
    }

    const webhookId = webhook.split('/')[webhook.split('/').length - 1];
    this.loggerService.info(`Transport connected at ${webhookId}`);
    this.loggerService.registerTransport(this);
  }

  /**
   * Returns minimum level for logging this transport.
   */
  public getLevel(): LoggerLevel {
    return this.slackConfig.SLACK_LEVEL;
  }

  /**
   * Sends a log message to Slack configuring custom data and labels.
   * In case of failure it may lead to infinite loop, so check recursion.
   * @param params
   */
  public log(params: LoggerParams): void {
    const { environment, level, requestId, caller, message, data } = params;
    if (data?.messageBlocks || message === this.exceptionMessage) return;

    const maxCharacters = 3000;
    const separator = '  |  ';

    let slackMsg = `*${this.getSlackEnvironment(environment)}*${separator}`
      + `*${this.getSlackSeverity(level)}*${separator}`
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
          channel: this.slackConfig.SLACK_CHANNEL,
          username: this.slackConfig.SLACK_USERNAME,
          icon_url: this.slackConfig.SLACK_ICON_URL,
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
      this.loggerService.warning(this.exceptionMessage, e as Error, { message });
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
   * @param level
   */
  public getSlackSeverity(level: LoggerLevel): string {
    switch (level) {
      case LoggerLevel.FATAL: return '💀 Fatal';
      case LoggerLevel.ERROR: return '🚨 Error';
      case LoggerLevel.WARNING: return '⚠️ Warning';
      case LoggerLevel.NOTICE: return '✔️ Notice';
      case LoggerLevel.INFO: return 'ⓘ Info';
      case LoggerLevel.HTTP: return '🌐 Http';
      case LoggerLevel.DEBUG: return '🐞 Debug';
      case LoggerLevel.TRACE: return '🐜 Trace';
    }
  }

}
