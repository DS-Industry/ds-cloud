import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { DeviceStatus } from '../../../common/enums/device-status.enum';

export class UpdateDeviceDto {
  @IsOptional()
  @IsString({ message: 'Name must be of type string' })
  readonly name: string;

  @IsOptional()
  @IsNumber()
  readonly bayNumber: number;

  @IsOptional()
  @IsEnum(DeviceStatus)
  readonly status: DeviceStatus;

  @IsOptional()
  @IsString({ message: 'Description must be of type string ' })
  readonly description: string;
}
