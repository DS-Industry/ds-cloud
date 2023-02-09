import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Query,
} from '@nestjs/common';
import { DeviceService } from './device.service';
import { CreateDeviceDto } from './dto/req/create-device.dto';
import { UpdateDeviceDto } from './dto/req/update-device.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { diskStorage } from 'multer';
import { csvFileName, csvFileFilter } from '../utils/file.utils';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { FileUploadRequest } from '@/common/dto/file-upload-request.dto';

@Controller('device')
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  @Post()
  @Roles(Role.USER, Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async create(@Body() createDeviceDto: CreateDeviceDto) {
    return await this.deviceService.create(createDeviceDto);
  }

  @Post('/upload')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(
    FileInterceptor('file_asset', {
      storage: diskStorage({
        destination: './uploads',
        filename: csvFileName,
      }),
      fileFilter: csvFileFilter,
    }),
  )
  fileUpload(
    @UploadedFile() file: Express.Multer.File,
    @Query() fileUploadRequest: FileUploadRequest,
  ) {
    const { command } = fileUploadRequest;
    if (command == 'Insert') {
      return this.deviceService.groupUpload(file.filename);
    } else if (command == 'Update') {
      return this.deviceService.batchUpdate(file.filename);
    }
  }

  @Patch(':id')
  @Roles(Role.USER, Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  update(@Param('id') id: string, @Body() updateDeviceDto: UpdateDeviceDto) {
    return this.deviceService.findOneAndUpdate(id, updateDeviceDto);
  }

  @Get()
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  findAll() {
    return this.deviceService.findAll();
  }

  @Get(':id')
  @Roles(Role.USER, Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  findOne(@Param('id') id: string) {
    return this.deviceService.findOne(id);
  }

  @Delete(':id')
  @Roles(Role.USER, Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  remove(@Param('id') id: string) {
    return this.deviceService.remove(id);
  }
}
