import { IsNumberString } from 'class-validator';

export class SearchFilterDto {
  @IsNumberString()
  code?: string;
  search?: string; // The search query
  filter?: string;
}
