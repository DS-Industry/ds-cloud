import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ExternalMobileWriteRequest } from './dto/write-mobile-external.dto';
import { Variable, VariableDocument } from '../variable/schema/variable.schema';
import * as moment from 'moment';
import {
  BusyBayExceptions,
  DeviceInternalException,
  DeviceNetworkException,
} from '../common/helpers/exceptions';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Device, DeviceDocument } from '../device/schema/device.schema';
import { CollectionService } from '../app/collection/collection.service';
import { DeviceStatus } from '../common/enums/device-status.enum';
import {
  Collection,
  CollectionDocument,
} from '@/app/collection/Schema/collection.schema';
import { Price, PriceDocument } from '@/app/price/schema/price.schema';
import { Service, ServiceDocument } from '@/app/services/schema/service.schema';
import { DeviceType } from '@/common/enums/device-type.enum';
import { CostType } from '@/common/enums';

@Injectable()
export class ExternalService {
  constructor(
    @InjectModel(Variable.name) private variableModel: Model<VariableDocument>,
    @InjectModel(Device.name) private deviceModel: Model<DeviceDocument>,
    @InjectModel(Collection.name)
    private collectionModel: Model<CollectionDocument>,
    @InjectModel(Price.name) private readonly priceModel: Model<PriceDocument>,
    @InjectModel(Service.name)
    private readonly serviceModel: Model<ServiceDocument>,
    private readonly collectionService: CollectionService,
  ) {}

  /**
   * Writing data to variables documents
   * Data is received from the controller
   * With interval of 10 seconds
   * Returning current data variables before updating db
   * @param id
   * @param data
   */
  public async writeControllerData(id: string, data: any) {
    const bulkOps = [];
    const res = {};
    const updateTime = new Date();

    const device = await this.deviceModel
      .findOne({ identifier: id })
      .select({ _id: 1, lastUpdateDate: 1, status: 1 });

    const currentVar: any[] = await this.variableModel
      .find({ owner: device._id })
      .select({ name: 1, value: 1 })
      .lean();

    if (currentVar.length == 0)
      throw new HttpException(
        'No variables found for this device',
        HttpStatus.NOT_FOUND,
      );

    for (let i = 0; i < data.length; i++) {
      const item = data[i].split(':');
      const match = currentVar.find((element) => element.name === item[0]);

      if (match.value !== item[1]) {
        bulkOps.push({
          updateOne: {
            filter: { owner: device._id, name: item[0] },
            update: {
              value: item[1],
            },
            upsert: true,
          },
        });
      }
      res[currentVar[i].name] = currentVar[i].value;
    }

    if (bulkOps.length > 0) {
      await this.variableModel.bulkWrite(bulkOps);
    }

    device.status = this.checkDeviceAvailability(currentVar);
    device.lastUpdateDate = updateTime;
    await device.save();

    return res;
  }

  /**
   * Writing data to variables documents
   * Data is received from mobile application
   * Request comes when user tries to turn on the equipment
   * Returning current data variables before updating db
   * @param id
   * @param data
   */
  public async writeMobileData(id: string, data: ExternalMobileWriteRequest) {
    const bulkOps = [];
    const device = await this.deviceModel
      .findOne({ identifier: id })
      .select({ _id: 1, lastUpdateDate: 1 });

    const currentVar: any[] = await this.variableModel
      .find({ owner: device._id })
      .select({ name: 1, value: 1 })
      .lean();

    if (currentVar.length == 0)
      throw new HttpException(
        'No variables found for this device',
        HttpStatus.NOT_FOUND,
      );
    //If device is busy returning error
    currentVar.map((item) => {
      if (item.name == 'GVLErr' && parseInt(item.value) > 0) {
        throw new DeviceInternalException(device._id);
      } else if (item.name == 'GVLTime' && parseInt(item.value) > 0) {
        throw new BusyBayExceptions(device._id);
      } else if (item.name == 'GVLSum' && parseInt(item.value) > 0) {
        throw new BusyBayExceptions(device._id);
      } else if (moment().diff(device.lastUpdateDate, 'minutes') >= 3) {
        throw new DeviceNetworkException(device._id);
      }
    });

    for (const item of Object.entries(data)) {
      bulkOps.push({
        updateOne: {
          filter: { owner: device._id, name: item[0] },
          update: {
            value: item[1],
          },
          upsert: true,
        },
      });
    }

    if (bulkOps.length > 0) {
      await this.variableModel.bulkWrite(bulkOps);
    }
    return currentVar;
  }

  /**
   * Get list of all collection with their child documents
   * @param integrationCode
   */
  public async getCollectionList(integrationCode: number) {
    return await this.collectionService.findAllByIntegration(integrationCode);
  }

  public checkDeviceAvailability(currentVaribales: any[]): DeviceStatus {
    let status: DeviceStatus = DeviceStatus.FREE;

    currentVaribales.map((item) => {
      if (item.name == 'GVLErr' && parseInt(item.value) > 0) {
        status = DeviceStatus.UNAVAILABLE;
      } else if (item.name == 'GVLTime' && parseInt(item.value) > 0) {
        status = DeviceStatus.BUSY;
      } else if (item.name == 'GVLSum' && parseInt(item.value) > 0) {
        status = DeviceStatus.BUSY;
      }
    });

    return status;
  }

  public async getDeviceByCarwashIdAndBayNumber(
    carwashId: string,
    bayNumber: number,
  ) {
    const collection =
      await this.collectionService.getCollectionDeviceByBayNumber(
        carwashId,
        bayNumber,
      );

    return collection;
  }

  public async fixCollectionDocument() {
    const devices = await this.deviceModel.find().lean();
    let updates = 0;
    const total = devices.length;

    for (const device of devices) {
      const collection = await this.collectionModel.findOne({
        _id: device.owner,
      });

      if (
        String(device.owner) === String(collection._id) &&
        collection.devices.indexOf(device._id) == 0
      ) {
        collection.devices.push(device);
        await collection.save();
        updates += 1;
      } else {
        continue;
      }
    }
    return {
      code: 200,
      message: 'collections up to date',
      count: updates,
      totalDevices: total,
    };
  }

  public async writePriceData(deviceId: string, priceData: string) {
    const device: Device = await this.deviceModel
      .findOne({
        identifier: deviceId,
      })
      .select({ _id: 1, type: 1 })
      .lean();

    //Parse data
    const data = JSON.parse(priceData);
    const prices = [];

    for (const key in data) {
      const service = await this.serviceModel
        .findOne({ id: Number(key) })
        .lean();

      const costType: CostType =
        device.type == DeviceType.BAY ? CostType.PERMINUTE : CostType.FIX;
      const price = await this.priceModel.findOneAndUpdate(
        { service: service._id },
        {
          cost: data[key],
          collectionId: device.identifier,
          costType: costType,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );

      prices.push(price._id);
    }

    await this.deviceModel.updateOne(
      { _id: device },
      { $addToSet: { prices: prices } },
    );

    return { code: 200 };
  }
}
