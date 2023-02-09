import { IsEnum } from 'class-validator';
import { CommandType } from '../enums/command-type.enum';

export class FileUploadRequest {
  @IsEnum(CommandType)
  command: string;
}
