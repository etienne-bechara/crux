import { Injectable } from '@nestjs/common';
import Pyroscope from '@pyroscope/nodejs';

import { AppConfig } from '../app/app.config';
import { LogService } from '../log/log.service';
import { ProfileConfig } from './profile.config';

@Injectable()
export class ProfileService {

  public constructor(
    private readonly appConfig: AppConfig,
    private readonly logService: LogService,
    private readonly profileConfig: ProfileConfig,
  ) {
    this.setupProfiler();
  }

  /**
   * Acquires configured profile URL giving priority to environment variable.
   */
  private buildProfileUrl(): string {
    const { profiles } = this.appConfig.APP_OPTIONS || { };
    const { url } = profiles;
    return this.profileConfig.PROFILE_URL || url;
  }

  /**
   * Ensures application has a valid push URL configured in order to
   * enable profiling.
   */
  public isEnabled(): boolean {
    const profileUrl = this.buildProfileUrl();

    if (!this.appConfig.APP_OPTIONS.disableProfiles && !profileUrl) {
      this.logService.warning('Profiling disabled due to missing URL');
      this.appConfig.APP_OPTIONS.disableProfiles = true;
    }

    return !this.appConfig.APP_OPTIONS.disableProfiles;
  }

  /**
   * Sets up profiler using Pyroscope.
   */
  private setupProfiler(): void {
    if (!this.isEnabled()) return;

    const { name: job, instance, profiles } = this.appConfig.APP_OPTIONS || { };
    const { username, password, pushInterval } = profiles;
    const environment = this.appConfig.NODE_ENV;

    process.env['PYROSCOPE_SAMPLING_DURATION'] ??= String(pushInterval);

    Pyroscope.init({
      serverAddress: this.buildProfileUrl(),
      appName: job,
      basicAuthUser: username,
      basicAuthPassword: password,
      tags: { environment, job, instance },
    });

    Pyroscope.start();
  }

}
