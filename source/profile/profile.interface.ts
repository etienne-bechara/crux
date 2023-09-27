export interface ProfileOptions {
  /** Pyroscope API URL to publish profiles. Can be overridden by env `PROFILE_URL`. */
  url?: string;
  /** Pyroscope username to publish profiles. Can be overridden by env `PROFILE_USERNAME`. */
  username?: string;
  /** Pyroscope password to publish profiles. Can be overridden by env `PROFILE_PASSWORD`. */
  password?: string;
}
