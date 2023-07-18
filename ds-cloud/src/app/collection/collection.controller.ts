import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CollectionService } from './collection.service';
import { CreateCollectionDto } from './dto/req/create-collection.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { csvFileFilter, csvFileName } from '../../utils/file.utils';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { RolesGuard } from '../../auth/guard/roles.guard';
import { FileUploadRequest } from '../../common/dto/file-upload-request.dto';
import { UpdateCollectionDto } from './dto/req/update-collection.dto';
import { AddTag } from '@/app/collection/dto/req/add-tag.dto';

@Controller('collection')
export class CollectionController {
  constructor(private readonly collectionService: CollectionService) {}

  //Create new collection
  @Post()
  @Roles(Role.USER, Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  create(@Body() createCollectionDto: CreateCollectionDto, @Req() req) {
    const { user } = req;
    return this.collectionService.create(createCollectionDto, user._id);
  }

  //Update single collection by ObjectId
  @Patch(':id')
  @Roles(Role.ADMIN, Role.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  update(
    @Param('id') _id: string,
    @Body() updateCollectionReq: UpdateCollectionDto,
  ) {
    return this.collectionService.findOneAndUpdate(_id, updateCollectionReq);
  }

  //File operations - insert many or update many from csv
  @Post('upload')
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
    @Req() req,
    @UploadedFile() file: Express.Multer.File,
    @Query() fileUploadRequest: FileUploadRequest,
  ) {
    const { user } = req;
    const { command } = fileUploadRequest;
    if (command == 'Insert') {
      return this.collectionService.groupUpload(file.filename, user._id);
    } else if (command == 'Update') {
      return this.collectionService.batchUpdate(file.filename);
    }
  }

  //TODO DELTE temp Function
  @Get('/integration/:code')
  @Roles(Role.ADMIN, Role.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  findAll(@Param('code') code: string) {
    return this.collectionService.findAllByIntegration(+code);
  }

  @Get('/integration/group/:code')
  @Roles(Role.ADMIN, Role.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  findAllLocationGroup(@Param('code') code: string) {
    return this.collectionService.findAllByIntegrationLocationGroup(+code);
  }

  //Get collection by authenticated user
  @Get('/mine')
  @Roles(Role.ADMIN, Role.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  getCollectionByOwner(@Req() req) {
    const { user } = req;
    return this.collectionService.getCollectionsByOwner(user._id);
  }

  @Post('/tag/add')
  @Roles(Role.ADMIN, Role.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  addTag(@Body() body: AddTag) {
    return this.collectionService.addTag(body.identifier, body.tagName);
  }

  //Get single collection by id
  @Get(':id')
  @Roles(Role.ADMIN, Role.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  findOne(@Param('id') id: string) {
    return this.collectionService.findOneByIdentifier(id);
  }

  //Delete collection by id
  @Delete(':id')
  @Roles(Role.ADMIN, Role.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  remove(@Param('id') id: string) {
    return this.collectionService.remove(id);
  }
}
