import { Injectable } from '@nestjs/common';
import { decycle } from 'cycle';

import { AppEnvironment } from '../../../app/app.enum';
import { HttpService } from '../../../http/http.service';
import { LoggerLevel } from '../../logger.enum';
import { LoggerParams, LoggerTransport } from '../../logger.interface';
import { LoggerTransportOptions } from '../../logger.interface/logger.transport.options';
import { LoggerService } from '../../logger.service';
import { SlackConfig } from './slack.config';

@Injectable()
export class SlackService implements LoggerTransport {

  public constructor(
    protected readonly slackConfig: SlackConfig,
    protected readonly loggerService: LoggerService,
    protected readonly httpService: HttpService,
  ) {
    this.loggerService.registerTransport(this);
  }

  /**
   * Returns the options array for this logging transport.
   */
  public getOptions(): LoggerTransportOptions {
    const environment = this.slackConfig.NODE_ENV;
    const options = this.slackConfig.SLACK_TRANSPORT_OPTIONS;

    if (!this.slackConfig.SLACK_WEBHOOK || !this.slackConfig.SLACK_CHANNEL) {
      return { environment, level: null };
    }

    return options.find((o) => o.environment === environment);
  }

  /**
   * Sends a log message to Slack configuring custom data and labels.
   * In case of failure it may lead to infinite loop, so check recursion.
   * @param params
   */
  public log(params: LoggerParams): void {
    if (params.data?.messageBlocks) return;

    const messageBlocks: any[] = [
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Environment*\n>${this.getSlackEnvironment()}` },
          { type: 'mrkdwn', text: `*Severity*\n>${this.getSlackSeverity(params.level)}` },
        ],
      },
      {
        type: 'section',
        text: { type: 'mrkdwn', text: `*Message*\n>${params.message}` },
      },
    ];

    if (params.data) {
      const details = JSON.stringify(decycle(params.data || { }), null, 2);
      messageBlocks.push({
        type: 'section',
        text: { type: 'mrkdwn', text: `*Details*\n\`\`\`\n${details}\n\`\`\`` },
      });
    }

    messageBlocks.push({
      type: 'context',
      elements: [
        { type: 'mrkdwn', text: `Reported at ${new Date().toUTCString()}` },
      ],
    });

    messageBlocks.push({ type: 'divider' });

    void this.publishSlackMessage(messageBlocks);
  }

  /**
   * Publishes a message formatted as Slack blocks.
   * @param messageBlocks
   */
  public async publishSlackMessage(messageBlocks: any[]): Promise<void> {
    try {
      await this.httpService.post('', {
        json: {
          channel: this.slackConfig.SLACK_CHANNEL,
          username: this.slackConfig.SLACK_USERNAME || 'Notification Bot',
          icon_url: this.slackConfig.SLACK_ICON_URL,
          blocks: messageBlocks,
        },
      });
    }
    catch (e) {
      this.loggerService.warning('[SlackService] Failed to publish slack message', e, { messageBlocks });
    }
  }

  /**
   * Translates application environment into Slack environment label.
   */
  public getSlackEnvironment(): string {
    switch (this.slackConfig.NODE_ENV) {
      case AppEnvironment.PRODUCTION: return '🟥  Production';
      case AppEnvironment.STAGING: return '🟧  Staging';
      case AppEnvironment.DEVELOPMENT: return '🟨  Development';
      case AppEnvironment.LOCAL: return '🟩  Local';
      case AppEnvironment.TEST: return '🟩  Test';
    }
  }

  /**
   * Translates application log level into Slack severity label.
   * @param level
   */
  public getSlackSeverity(level: LoggerLevel): string {
    switch (level) {
      case LoggerLevel.CRITICAL: return '🚨  Critical';
      case LoggerLevel.ERROR: return '🛑  Error';
      case LoggerLevel.WARNING: return '⚠️  Warning';
      case LoggerLevel.NOTICE: return '✔️  Notice';
      case LoggerLevel.INFO: return 'ℹ️  Info';
      case LoggerLevel.HTTP: return '🌐  Http';
      case LoggerLevel.DEBUG: return '🐞  Debug';
    }
  }

}
