import { IsEnum } from 'class-validator';
import { CommandType } from '../../../../common/enums/command-type.enum';

export class FileUploadRequest {
  @IsEnum(CommandType)
  command: string;
}
