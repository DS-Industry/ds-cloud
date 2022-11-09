import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CollectionService } from './collection.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { csvFileFilter, csvFileName } from '../utils/file.utils';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { RolesGuard } from '../auth/guard/roles.guard';
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

@ApiTags('Collection')
@Controller('collection')
export class CollectionController {
  constructor(private readonly collectionService: CollectionService) {}

  @Post()
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({ summary: 'Create a collection' })
  @ApiCreatedResponse({ description: 'Created Successfully' })
  @ApiUnprocessableEntityResponse({ description: 'Bad Request' })
  @ApiConflictResponse({ description: 'Conflict Request' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  create(@Body() createCollectionDto: CreateCollectionDto, @Req() req) {
    const { user } = req;
    return this.collectionService.create(createCollectionDto, user._id);
  }

  @Post('upload')
  @ApiOperation({ summary: 'Group create collection from excel file' })
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
  @ApiCreatedResponse({ description: 'Created Successfully' })
  @ApiUnprocessableEntityResponse({ description: 'Bad Request' })
  @ApiConflictResponse({ description: 'Conflict Request' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
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
  fileUpload(@Req() req, @UploadedFile() file: Express.Multer.File) {
    const { user } = req;
    return this.collectionService.groupUpload(file.filename, user._id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all existing collections' })
  @ApiOkResponse({ description: 'The resource was returned successfully' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @Roles(Role.ADMIN, Role.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  findAll() {
    return this.collectionService.findAll();
  }

  @Get('/mine')
  @ApiOperation({ summary: 'Get collection of logged in user' })
  @ApiOkResponse({ description: 'The resource was returned successfully' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @Roles(Role.ADMIN, Role.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  getCollectionByOwner(@Req() req) {
    const { user } = req;
    return this.collectionService.getCollectionsByOwner(user._id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get collection by collection id' })
  @ApiParam({ name: 'id', required: true, type: 'int' })
  @ApiOkResponse({ description: 'The resource was returned successfully' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @Roles(Role.ADMIN, Role.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  findOne(@Param('id') id: string) {
    return this.collectionService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete collection by id' })
  @ApiParam({ name: 'id', required: true, type: 'int' })
  @ApiOkResponse({ description: 'The resource was updated successfully' })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @Roles(Role.ADMIN, Role.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  remove(@Param('id') id: string) {
    return this.collectionService.remove(id);
  }
}
