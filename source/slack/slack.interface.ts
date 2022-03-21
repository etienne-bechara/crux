import { LogSeverity } from '../log/log.enum';

export interface SlackOptions {
  /** Slack severity to enable publishing logs. Can be overridden by env `SLACK_SEVERITY`. Default: `warn`. */
  severity?: LogSeverity;
  /** Slack webhook to publish logs. Can be overridden by env `SLACK_WEBHOOK`. */
  webhook?: string;
  /** Slack channel to publish logs. Can be overridden by env `SLACK_CHANNEL`. */
  channel?: string;
  /** Slack username to publish logs. Can be overridden by env `SLACK_USERNAME`. */
  username?: string;
  /** Slack profile icon URL to publish logs. Can be overridden by env `SLACK_ICON_URL`. */
  iconUrl?: string;
}
