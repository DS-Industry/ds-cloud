import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { getCSVFile } from '../utils/file.utils';
import * as fs from 'fs';
import * as iconv from 'iconv-lite';
import { CollectionFileModel } from '../utils/collection-file-model.utils';
import { CsvParser } from 'nest-csv-parser';
import { UserService } from '../user/user.service';
import { CollectionRepository } from './collection.repository';

@Injectable()
export class CollectionService {
  constructor(
    private readonly collectionRepository: CollectionRepository,
    private readonly userService: UserService,
    private readonly csvParser: CsvParser,
  ) {}

  /**
   * Creating new collection (Device group)
   * Collection is owned by a user that is placing request
   * @param createCollectionDto
   * @param userId
   */
  async create(createCollectionDto: CreateCollectionDto, userId: string) {
    const data = {
      ...createCollectionDto,
      owner: userId,
      isActive: true,
    };

    return await this.collectionRepository.create(data);
  }

  /**
   * Returning all collections in db
   */
  async findAll() {
    return await this.collectionRepository.findAll({}, ['owner']);
  }

  async findOneByIdentifier(identifier: string) {
    return await this.collectionRepository.findOneByFilter({
      identifier: identifier,
    });
  }

  /**
   * Uploading existing collections from csv file
   * The file has to be in the special format
   * After reading inserting the data in the db
   * @param fileName
   */
  async groupUpload(fileName: string, userId: string) {
    //Getting correct path through utils methods getCsvFile
    const path = getCSVFile(fileName);

    //Creating stream
    //Adding decoding to stream to support Russian language
    const stream = fs.createReadStream(path).pipe(iconv.decodeStream('utf-8'));
    const data = await this.csvParser.parse(
      stream,
      CollectionFileModel,
      null,
      null,
      { separator: ',' },
    );

    let createCount = 0;

    for (const item of data.list) {
      await this.collectionRepository.create({
        ...item,
        owner: userId,
        isActive: true,
      });
      createCount++;
    }
    fs.unlinkSync(path);
    return { code: HttpStatus.OK, createdItems: createCount };
  }

  /**
   * Get collection by Id
   * @param id
   */
  async findOne(id: string) {
    const collection = await this.collectionRepository.findOneById(id);

    if (!collection)
      throw new NotFoundException(`Collection with id ${id} not found`);

    return collection;
  }

  /**
   * Get all collection by user that making the request
   * @param ownerId
   */
  async getCollectionsByOwner(ownerId: string) {
    const collections = await this.collectionRepository.findAll({
      owner: ownerId,
    });

    if (!collections)
      throw new NotFoundException(
        `Collections for owner id: ${ownerId} not found`,
      );

    return collections;
  }

  /**
   * Remove collection by id
   * @param id
   */
  async remove(id: string) {
    const removed = await this.collectionRepository.removeMany({ _id: id });
    if (!removed)
      throw new BadRequestException(
        `Unable to remove collection with id: ${id}`,
      );

    return { code: HttpStatus.OK, message: 'Success' };
  }
}
