import os from 'os';

export interface UtilAppStatus {
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
  network: UtilAppNetwork;
}

export interface UtilAppNetwork {
  public_ip: string;
  interfaces: NodeJS.Dict<os.NetworkInterfaceInfo[]>;
}
