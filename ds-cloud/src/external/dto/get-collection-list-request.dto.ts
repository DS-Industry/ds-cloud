import { IsDefined, IsNumberString } from 'class-validator';

export class GetCollectionListRequest {
  @IsDefined()
  @IsNumberString()
  code: number;
}
