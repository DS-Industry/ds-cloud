import { IsDecimal, IsDefined, IsString } from 'class-validator';

export class CreateTag {
  @IsString()
  @IsDefined()
  name: string;
  @IsString()
  @IsDefined()
  color: string;
}
