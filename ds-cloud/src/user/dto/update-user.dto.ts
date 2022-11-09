import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsString({ message: 'Name must be of type string' })
  @IsOptional()
  name: string;

  @IsString({ message: 'Email must be of type string' })
  @IsOptional()
  email: string;
}
