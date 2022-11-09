import { Injectable } from '@nestjs/common';
import { MongoGenericRepository } from '../core/repository/mongo-generic.repository';
import { Device, DeviceDocument } from './schema/device.schema';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';

@Injectable()
export class DeviceRepository extends MongoGenericRepository<DeviceDocument> {
  constructor(@InjectModel(Device.name) deviceModel: Model<DeviceDocument>) {
    super(deviceModel);
  }

  async findOnePopulated(
    query: FilterQuery<DeviceDocument>,
    populatedItems: string[],
  ) {
    return this.entiryModel.findOne(query).populate(populatedItems).exec();
  }
}
