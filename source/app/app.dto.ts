import os from 'os';

import { IsNumber, IsObject, IsString, Min } from '../validate/validate.decorator';

export class AppStatusSystem {

  @IsString()
  public version: string;

  @IsString()
  public type: string;

  @IsString()
  public release: string;

  @IsString()
  public architecture: string;

  @IsString()
  public endianness: string;

  @IsNumber() @Min(0)
  public uptime: number;

}

export class AppStatusMemory {

  @IsNumber() @Min(0)
  public total: number;

  @IsNumber() @Min(0)
  public free: number;

}

export class AppStatusCpuTimes {

  @IsNumber() @Min(0)
  public user: number;

  @IsNumber() @Min(0)
  public nice: number;

  @IsNumber() @Min(0)
  public sys: number;

  @IsNumber() @Min(0)
  public idle: number;

  @IsNumber() @Min(0)
  public irq: number;

}

export class AppStatusCpu {

  @IsString()
  public model: string;

  @IsNumber() @Min(0)
  public speed: number;

  @IsObject(AppStatusCpuTimes)
  public times: AppStatusCpuTimes;

}

export class AppStatusNetwork {

  @IsObject({ }, { each: true })
  public interfaces: NodeJS.Dict<os.NetworkInterfaceInfo[]>;

}

export class AppStatus {

  @IsObject(AppStatusSystem)
  public system: AppStatusSystem;

  @IsObject(AppStatusCpu, { each: true })
  public cpus: AppStatusCpu[];

  @IsObject(AppStatusMemory)
  public memory: AppStatusMemory;

  @IsObject(AppStatusNetwork)
  public network: AppStatusNetwork;

}
