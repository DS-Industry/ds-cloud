import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateDeviceDto } from './dto/req/create-device.dto';
import { UpdateDeviceDto } from './dto/req/update-device.dto';
import { CollectionService } from '../app/collection/collection.service';
import { CsvParser } from 'nest-csv-parser';
import * as fs from 'fs';
import * as moment from 'moment';
import { getCSVFile } from '../utils/file.utils';
import * as iconv from 'iconv-lite';
import { DeviceFileModel } from '../utils/device-file-model.util';
import { DeviceRepository } from './device.repository';
import { CollectionDocument } from '../app/collection/Schema/collection.schema';
import { inspect } from 'util';

@Injectable()
export class DeviceService {
  constructor(
    private readonly collectionService: CollectionService,
    private readonly deviceRepository: DeviceRepository,
    private readonly csvParser: CsvParser,
  ) {}

  /**
   * Creating new device.
   * Device is assigned to each collection (owner)
   * @param createDeviceDto
   */
  async create(createDeviceDto: CreateDeviceDto) {
    const owner = await this.collectionService.findOne(createDeviceDto.owner);
    const date = moment().toISOString();
    if (!owner)
      throw new NotFoundException(
        `Could not create device for collection: ${createDeviceDto.owner}`,
      );

    const data = {
      ...createDeviceDto,
      owner: owner.id,
      registrationDate: date,
    };

    return await this.deviceRepository.create(data);
  }

  /**
   * Group upload from the csv file.
   * File provided in specific format
   * Data read from file uploaded in db
   * @param fileName
   */
  async groupUpload(fileName: string) {
    //Getting file path from helper method getCsvFile
    const path = getCSVFile(fileName);
    //Creating stream. Adding decoding to support Russian language
    const stream = fs.createReadStream(path).pipe(iconv.decodeStream('utf-8'));

    let createCount = 0;
    const errors = [];

    const data = await this.csvParser.parse(
      stream,
      DeviceFileModel,
      null,
      null,
      { separator: ',' },
    );

    for (const item of data.list) {
      const owner = await this.collectionService.findOneByIdentifier(
        item.collection,
      );
      if (!owner) {
        errors.push(item.id);
        continue;
      }
      const data = {
        name: item.name,
        identifier: item.id,
        owner: owner._id,
        status: 1,
        registrationDate: moment().toISOString(),
      };

      const device = await this.deviceRepository.create(data);
      if (!device) throw new InternalServerErrorException('Error on uploading');
      createCount++;
    }
    fs.unlinkSync(path);
    return { code: HttpStatus.OK, createdItems: createCount, errors: errors };
  }

  /**
   * [TEMP FUNCTION TO UPDATE DB]
   * TODO Do not forget to delete
   * Getting all devices from db
   */
  async findAll() {

    const devices = await this.deviceRepository.findAll({});

    for (const dev of devices) {
      const owner = dev.owner;

      if (!owner) continue;

      const collection = await this.collectionService.findOne(owner);

      if (!collection) continue;

      await this.collectionService.findOneAndUpdate(collection._id, dev);
    }


  }

  /**
   * Get one device by id
   * @param id
   */
  async findOne(id: string) {
    const device = await this.deviceRepository.findOnePopulated({ _id: id }, [
      'owner',
      'variables',
    ]);

    if (!device) throw new NotFoundException(`Device with ${id} not found`);

    return device;
  }

  /**
   * Get single device by unified identifier
   * Identifier from ORACLE DB
   * @param id
   */
  async findByIdentifierAndPopulate(identifier: string) {
    const device = await this.deviceRepository.findOnePopulated(
      {
        identifier: identifier,
      },
      ['owner', 'variables'],
    );
    return device;
  }

  async findByIdentifier(identifier: string, selectOptions: any = { _id: 1 }) {
    const device = await this.deviceRepository.findOneByFilter(
      { identifier: identifier },
      selectOptions,
    );
    return device;
  }

  /**
   * Upading device my id
   * @param id
   * @param updateDeviceDto
   */
  async update(id: string, updateDeviceDto: UpdateDeviceDto) {
    const device = await this.deviceRepository.findOneAndUpdate(
      { identifier: id },
      updateDeviceDto,
    );

    if (!device)
      throw new NotFoundException(
        `Update Error: Device with id ${id} not found`,
      );

    return device;
  }

  /**
   * Insert new variable to array of variables
   * inside device model
   * @param id
   * @param itemId
   */
  async addVariable(id: string, itemId: string) {
    const device = await this.deviceRepository.findOneAndUpdate(
      { _id: id },
      { $push: { variables: itemId } },
    );

    if (!device)
      throw new NotFoundException(
        `Update Error: Device with id ${id} not found`,
      );

    return device;
  }

  async removeVariable(id: string, itemId: string) {
    const device = await this.deviceRepository.findOneAndUpdate(
      { _id: id },
      { $pull: { variables: itemId } },
    );

    if (!device)
      throw new NotFoundException(
        `Update Error: Device with id ${id} not found`,
      );

    return device;
  }

  /**
   * Remove device by id
   * @param id
   */
  async remove(id: string) {
    const isRemoved = await this.deviceRepository.removeMany({ _id: id });

    if (!isRemoved)
      throw new NotFoundException(
        `Delete Error: device with id ${id} is not found`,
      );

    return { code: HttpStatus.OK, message: 'Success' };
  }
}
