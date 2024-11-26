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
import { DeviceStatus } from '@/common/enums';
import { Device, DeviceDocument } from '@/device/schema/device.schema';

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
    const { ownerId, ...deviceData } = createDeviceDto;
    const owner: CollectionDocument =
      await this.collectionService.findOneByIdentifier(createDeviceDto.ownerId);

    deviceData['date'] = moment().toISOString();
    deviceData['owner'] = owner._id;

    const device: DeviceDocument = await this.deviceRepository.create(
      deviceData,
    );

    if (!owner)
      throw new NotFoundException(`Collection with id ${ownerId} is not found`);

    owner.devices.push(device._id);
    await owner.save();

    return device;
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
      const { collection, id, ...deviceData } = item;
      const owner: CollectionDocument =
        await this.collectionService.findOneByIdentifier(collection);
      if (!owner) {
        errors.push(item.id);
        continue;
      }
      deviceData['owner'] = owner._id;
      deviceData['registrationDate'] = moment().toISOString();
      deviceData['identifier'] = id;
      deviceData['status'] = DeviceStatus.FREE;

      const device: DeviceDocument = await this.deviceRepository.create(
        deviceData,
      );

      owner.devices.push(device._id);
      await owner.save();
      createCount++;
    }
    fs.unlinkSync(path);
    return { code: HttpStatus.OK, createdItems: createCount, errors: errors };
  }

  /**
   * Bulk update devices
   * @param fileName
   */
  async batchUpdate(fileName: string):Promise<any> {
    //Getting file path from helper method getCsvFile
    const path = getCSVFile(fileName);
    //Creating stream. Adding decoding to support Russian language
    const stream = fs.createReadStream(path).pipe(iconv.decodeStream('utf-8'));
    const bulkOps = [];

    const data = await this.csvParser.parse(
      stream,
      DeviceFileModel,
      null,
      null,
      { separator: ',' },
    );

    for (const item of data.list) {
      const updateQuery = {
        name: item.name,
        bayNumber: Number(item.bayNumber),
        status: DeviceStatus.FREE,
      };

      bulkOps.push({
        updateOne: {
          filter: { identifier: item.identifier },
          update: updateQuery,
          upsert: true,
        },
      });
    }

    fs.unlinkSync(path);

    return await this.deviceRepository.batchUpdate(bulkOps);
  }

  /**
   * Update device by identifier
   * @param id
   * @param updateDevice
   */
  async findOneAndUpdate(id: string, updateDevice: UpdateDeviceDto) {
    let updateQuery;

    if (updateDevice.variables) {
      //Create logic to update variables array
    } else {
      updateQuery = { ...updateDevice };
    }

    return await this.deviceRepository.findOneAndUpdate(
      { identifier: id },
      updateQuery,
    );
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

      //await this.collectionService.findOneAndUpdate(collection._id, dev);
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
