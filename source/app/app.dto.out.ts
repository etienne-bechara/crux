import os from 'os';

export interface AppStatusSystemDto {
  version: string;
  type: string;
  release: string;
  architecture: string;
  endianness: string;
  uptime: number;
}

export interface AppStatusMemoryDto {
  total: number;
  free: number;
}

export interface AppStatusCpuTimesDto {
  user: number;
  nice: number;
  sys: number;
  idle: number;
  irq: number;
}

export interface AppStatusCpuDto {
  model: string;
  speed: number;
  times: AppStatusCpuTimesDto;
}

export interface AppStatusNetworkDto {
  interfaces: NodeJS.Dict<os.NetworkInterfaceInfo[]>;
}

export interface AppStatusDto {
  system: AppStatusSystemDto;
  cpus: AppStatusCpuDto[];
  memory: AppStatusMemoryDto;
  network: AppStatusNetworkDto;
}
