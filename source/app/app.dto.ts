import os from 'os';

export interface AppStatusSystem {
  version: string;
  type: string;
  release: string;
  architecture: string;
  endianness: string;
  uptime: number;
}

export interface AppStatusMemory {
  total: number;
  free: number;
}

export interface AppStatusCpuTimes {
  user: number;
  nice: number;
  sys: number;
  idle: number;
  irq: number;
}

export interface AppStatusCpu {
  model: string;
  speed: number;
  times: AppStatusCpuTimes;
}

export interface AppStatusNetwork {
  interfaces: NodeJS.Dict<os.NetworkInterfaceInfo[]>;
}

export interface AppStatus {
  system: AppStatusSystem;
  cpus: AppStatusCpu[];
  memory: AppStatusMemory;
  network: AppStatusNetwork;
}
