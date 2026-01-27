import {IsDefined, IsNumberString} from "class-validator";

export class GetCollectionDeviceRequest {
  @IsDefined()
  @IsNumberString()
  carwashId: string;
  
  @IsDefined()
  @IsNumberString()
  carWashDeviceId: string;
}

