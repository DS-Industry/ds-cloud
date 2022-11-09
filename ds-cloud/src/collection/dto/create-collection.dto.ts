import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateCollectionDto {
  @IsString({ message: 'Name must be of type string ' })
  @IsNotEmpty({ message: 'Name is required ' })
  name: string;

  @IsString({ message: 'Identifier must be of type string' })
  @IsNotEmpty({ message: 'Identifier is required ' })
  identifier: string;

  @IsString({ message: 'City must be of type string' })
  @IsNotEmpty({ message: 'City is required ' })
  city: number;

  //@IsString({ message: 'Owner must be of type string' })
  //@IsNotEmpty({ message: 'Owner is required ' })
  onwer: string;
}
