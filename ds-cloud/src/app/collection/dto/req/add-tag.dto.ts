import { IsDefined, IsString } from 'class-validator';

export class AddTag {
  @IsString()
  @IsDefined()
  identifier: string;
  @IsString()
  @IsDefined()
  tagName: string;
}
