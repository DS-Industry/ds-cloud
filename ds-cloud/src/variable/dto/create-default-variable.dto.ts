import { IsBoolean, IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CreateDefaultVariableDto {
  @IsString({ message: 'Owner identifier must be of type string' })
  @IsNotEmpty({ message: 'Owner identifier is required' })
  owner: string;
}
