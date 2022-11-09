import { IsBoolean, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { DataType } from '../enum/data-type.enum';

export class CreateVariableDto {
  @IsNotEmpty({ message: 'Name is required' })
  @IsString({ message: 'Name must be of type string' })
  name: string;

  @IsNotEmpty({ message: 'Value is required' })
  @IsString({ message: 'Value must be of type string' })
  value: string;

  @IsString({ message: 'Owner object id must be of type string' })
  @IsNotEmpty({ message: 'Owner object id is required' })
  owner: string;

  @IsEnum(DataType)
  type: string;

  @IsString({ message: 'Description must be of type string ' })
  description: string;
}
