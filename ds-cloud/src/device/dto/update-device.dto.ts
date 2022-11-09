import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateDeviceDto {
  @IsOptional()
  @IsString({ message: 'Name must be of type string' })
  readonly name: string;

  @IsOptional()
  @IsNumber()
  status: number;

  @IsOptional()
  @IsString({ message: 'Description must be of type string ' })
  readonly description: string;
}
