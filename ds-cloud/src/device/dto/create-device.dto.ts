import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

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

  @IsString({ message: 'Description must be of type string ' })
  readonly type: string;
}
