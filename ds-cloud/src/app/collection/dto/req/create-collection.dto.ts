import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { CollectionType } from '@/common/enums';
import { CreateExistingService } from '@/app/services/dto/req/create-existing-service.dto';

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

  @IsString({ message: 'Address must be of type string' })
  @IsNotEmpty({ message: 'Address is required ' })
  address: string;

  @IsNotEmpty({ message: 'Latitude is required ' })
  lat: number;

  @IsNotEmpty({ message: 'Longitude is required ' })
  lon: number;

  @IsEnum(CollectionType)
  type: CollectionType;

  @IsOptional()
  @IsNumber()
  limitMaxCost?: number;

  @IsOptional()
  @IsNumber()
  limitMinCost?: number;

  @IsOptional()
  @IsNumber()
  stepCost?: number;

  @IsOptional()
  @IsArray()
  priceList?: CreateExistingService[];
}
