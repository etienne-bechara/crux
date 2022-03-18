import { AppEnvironment } from '../app/app.enum';
import { LoggerSeverity } from './logger.enum';

export type LoggerArguments = string | Error | Record<string, any>;

export interface LoggerParams {
  environment: AppEnvironment;
  timestamp: string;
  severity: LoggerSeverity;
  requestId: string;
  caller: string;
  message: string;
  data: Record<string, any>;
  error: Error;
}

export interface LoggerTransport {
  getSeverity: () => LoggerSeverity;
  log: (params: LoggerParams) => void;
}

export interface LoggerOptions {
  /**
   * Severity to trigger publishing logs at console. Can be overridden by env `CONSOLE_SEVERITY`.
   * Default: `trace` when local`, otherwise `warning`.
   */
  consoleSeverity?: LoggerSeverity;
  /** Format JSON when printing log details at console. */
  consolePretty?: boolean;
  /** Max length when stringifying details at console. */
  consoleMaxLength?: number;
  /** Severity to trigger publishing logs at Sentry. Can be overridden by env `SENTRY_SEVERITY`. Default: `error`. */
  sentrySeverity?: LoggerSeverity;
  /** Sentry DSN to publish logs. Can be overridden by env `SENTRY_DSN`. */
  sentryDsn?: string;
  /** Severity to trigger publishing logs at Slack. Can be overridden by env `SLACK_SEVERITY`. Default: `warn`. */
  slackSeverity?: LoggerSeverity;
  /** Slack webhook to publish logs. Can be overridden by env `SLACK_WEBHOOK`. */
  slackWebhook?: string;
  /** Slack channel to publish logs. Can be overridden by env `SLACK_CHANNEL`. */
  slackChannel?: string;
  /** Slack username to publish logs. Can be overridden by env `SLACK_USERNAME`. */
  slackUsername?: string;
  /** Slack profile icon URL to publish logs. Can be overridden by env `SLACK_ICON_URL`. */
  slackIconUrl?: string;
  /** Sensitive keys to be removed during logging of objects. */
  sensitiveKeys?: string[];
}
