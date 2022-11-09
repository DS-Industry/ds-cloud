import { CreateVariableDto } from './create-variable.dto';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { DataType } from '../enum/data-type.enum';

export class UpdateVariableDto {
  @IsNotEmpty({ message: 'Name is required' })
  @IsString({ message: 'Name must be of type string' })
  @IsOptional()
  name: string;

  @IsNotEmpty({ message: 'Value is required' })
  @IsString({ message: 'Value must be of type string' })
  @IsOptional()
  value: unknown;

  @IsEnum(DataType)
  @IsOptional()
  type: string;

  @IsString({ message: 'Description must be of type string ' })
  @IsOptional()
  description: string;
}
