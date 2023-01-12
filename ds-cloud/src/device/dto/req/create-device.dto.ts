import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { DeviceStatus } from '../../../common/enums/device-status.enum';

export class CreateDeviceDto {
  @IsNotEmpty({ message: 'Name is required' })
  @IsString({ message: 'Name must be of type string' })
  readonly name: string;

  @IsNotEmpty({ message: 'Owner id is required' })
  @IsString({ message: 'Owner id must be of type string ' })
  owner: string;

  @IsNotEmpty({ message: 'Identifier is required' })
  @IsString({ message: 'Identifier must be of type string' })
  readonly identifier: string;

  @IsNotEmpty({ message: 'Bay number is required' })
  @IsNumber()
  readonly bayNumber: number;

  @IsString({ message: 'Description must be of type string ' })
  readonly type: string;

  /*
  @IsEnum(DeviceStatus)
  readonly status: DeviceStatus;

   */
}
