import os from 'os';

export interface AppStatus {
  system: {
    version: string;
    type: string;
    release: string;
    architecture: string;
    endianness: string;
    uptime: number;
  };
  cpus: os.CpuInfo[];
  memory: {
    total: number;
    free: number;
  };
  network: AppNetwork;
}

export interface AppNetwork {
  publicIp: string;
  interfaces: NodeJS.Dict<os.NetworkInterfaceInfo[]>;
}
