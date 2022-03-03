import { AppModule } from './app.module';
import { AppService } from './app.service';

describe('AppService', () => {
  let appService: AppService;

  beforeAll(async () => {
    const app = await AppModule.compile({ disableAll: true });
    appService = app.get(AppService);
  });

  describe('getServerIp', () => {
    it('should acquire public ip successfully', async () => {
      const serverIp = await appService.getPublicIp();
      expect(serverIp).toBeDefined();
    });
  });

  describe('getAppStatus', () => {
    it('should read application cpu, memory and network', async () => {
      const appStatus = await appService.getStatus();
      expect(appStatus.system.uptime).toBeGreaterThan(0);
      expect(appStatus.memory.total).toBeGreaterThan(0);
      expect(appStatus.cpus.length).toBeGreaterThan(0);
    });
  });
});

