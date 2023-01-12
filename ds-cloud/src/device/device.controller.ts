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
import {
  ApiBody,
  ApiConflictResponse,
  ApiConsumes,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';

@ApiTags('Device')
@Controller('device')
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  @Post()
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({ summary: 'Create a device' })
  @ApiCreatedResponse({ description: 'Created Successfully' })
  @ApiUnprocessableEntityResponse({ description: 'Bad Request' })
  @ApiConflictResponse({ description: 'Conflict Request' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  async create(@Body() createDeviceDto: CreateDeviceDto) {
    return await this.deviceService.create(createDeviceDto);
  }

  @Post('/upload')
  @ApiOperation({ summary: 'Group create device from excel file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file_asset: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
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
  fileUpload(@UploadedFile() file: Express.Multer.File) {
    return this.deviceService.groupUpload(file.filename);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update device by id' })
  @ApiParam({ name: 'id', required: true, type: 'int' })
  @ApiOkResponse({ description: 'The resource was updated successfully' })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @ApiUnprocessableEntityResponse({ description: 'Bad Request' })
  @Roles(Role.USER, Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  update(@Param('id') id: string, @Body() updateDeviceDto: UpdateDeviceDto) {
    return this.deviceService.update(id, updateDeviceDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all existing devices' })
  @ApiOkResponse({ description: 'The resource was returned successfully' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  findAll() {
    return this.deviceService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find device by id' })
  @ApiParam({ name: 'id', required: true, type: 'int' })
  @ApiOkResponse({ description: 'The resource was updated successfully' })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @ApiUnprocessableEntityResponse({ description: 'Bad Request' })
  @Roles(Role.USER, Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  findOne(@Param('id') id: string) {
    return this.deviceService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete device by id' })
  @ApiParam({ name: 'id', required: true, type: 'int' })
  @ApiOkResponse({ description: 'The resource was updated successfully' })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @Roles(Role.USER, Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  remove(@Param('id') id: string) {
    return this.deviceService.remove(id);
  }
}
