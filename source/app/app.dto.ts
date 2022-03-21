import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import os from 'os';

import { IsNumber, IsObject, IsString, Min, ValidateNested } from '../validate/validate.decorator';

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

  @ValidateNested()
  @Type(() => AppStatusCpuTimes)
  @IsObject()
  public times: AppStatusCpuTimes;

}

export class AppStatusNetwork {

  @IsString()
  public publicIp: string;

  @IsObject()
  public interfaces: NodeJS.Dict<os.NetworkInterfaceInfo[]>;

}

export class AppStatus {

  @ValidateNested()
  @Type(() => AppStatusSystem)
  @IsObject()
  public system: AppStatusSystem;

  @ApiProperty({ type: [ AppStatusCpu ] })
  @ValidateNested()
  @Type(() => AppStatusCpu)
  @IsObject({ each: true })
  public cpus: AppStatusCpu[];

  @ValidateNested()
  @Type(() => AppStatusMemory)
  @IsObject()
  public memory: AppStatusMemory;

  @ValidateNested()
  @Type(() => AppStatusNetwork)
  @IsObject()
  public network: AppStatusNetwork;

}
