import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { DeviceStatus } from '../../../common/enums/device-status.enum';

export class UpdateDeviceDto {
  @IsOptional()
  @IsString()
  readonly name?: string;

  @IsOptional()
  @IsNumber()
  readonly bayNumber?: number;

  @IsOptional()
  @IsEnum(DeviceStatus)
  readonly status?: DeviceStatus;

  @IsOptional()
  @IsString()
  readonly description?: string;

  @IsOptional()
  @IsArray()
  readonly variables?: any[];
}
