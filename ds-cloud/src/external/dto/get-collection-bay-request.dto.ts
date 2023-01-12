import { IsDefined, IsNumberString } from "class-validator";

export class GetCollectionBayRequest {
  @IsDefined()
  @IsNumberString()
  carwashId: string;
  @IsDefined()
  @IsNumberString()
  bayNumber: string;
}
