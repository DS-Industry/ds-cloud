import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { CollectionType } from '../../../../common/enums/collection-type.enum';

export class UpdateCollectionDto {
  @IsOptional()
  @IsString({ message: 'Name must be of type string' })
  readonly name?: string;
  @IsOptional()
  @IsEnum(CollectionType)
  type?: CollectionType;
  @IsOptional()
  @IsString({ message: 'Address must be of type string' })
  readonly address?: string;
  @IsOptional()
  @IsString({ message: 'City must be of type string' })
  readonly city?: string;
  @IsOptional()
  @IsBoolean({ message: 'Activity status must be boolean' })
  readonly isActive?: boolean;
  @IsOptional()
  @IsArray({ message: 'Must be array of numbers' })
  readonly integrations?: number[];
  @IsOptional()
  @IsArray({ message: 'Must be array of numbers' })
  readonly prices?: number[];
  @IsOptional()
  @IsNumber()
  readonly stepCost?: number;
  @IsOptional()
  @IsNumber()
  readonly limitMinCost?: number;
  @IsOptional()
  @IsNumber()
  readonly limitMaxCost?: number;
  @IsOptional()
  @IsNumber()
  readonly lat?: number;
  @IsOptional()
  @IsNumber()
  readonly lon?: number;
}
