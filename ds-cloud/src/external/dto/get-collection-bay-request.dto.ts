import {IsDefined, IsEnum, IsNumberString, IsOptional} from "class-validator";
import {DeviceType} from "@/common/enums/device-type.enum";

export class GetCollectionBayRequest {
  @IsDefined()
  @IsNumberString()
  carwashId: string;
  @IsDefined()
  @IsNumberString()
  bayNumber: string;

  @IsOptional()
  @IsEnum(DeviceType)
  type?: DeviceType;
}
