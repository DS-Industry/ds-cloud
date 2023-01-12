import { Injectable } from '@nestjs/common';
import { MongoGenericRepository } from '../../core/repository/mongo-generic.repository';
import { Collection, CollectionDocument } from './Schema/collection.schema';
import { InjectModel } from '@nestjs/mongoose';
import { LeanDocument, Model, Types } from 'mongoose';
import { CollectionDto } from './dto/core/collection.dto';

@Injectable()
export class CollectionRepository extends MongoGenericRepository<CollectionDocument> {
  constructor(
    @InjectModel(Collection.name) collectionModel: Model<CollectionDocument>,
  ) {
    super(collectionModel);
  }

  async batchUpdate(bulkOps: any[]) {
    return await this.entiryModel.bulkWrite(bulkOps);
  }

  async findAllByIntegration(_id: any, populateOnFind: string[]) {
    return await this.entiryModel
      .find({
        integrations: _id,
      })
      .populate(populateOnFind)
      .exec();
  }

  async findCollectionListByIntegration(_id: Types.ObjectId) {
    return this.entiryModel
      .find({
        integrations: _id,
      })
      .populate('devices')
      .populate({
        path: 'prices',
        populate: {
          path: 'service',
          model: 'Service',
        },
      })
      .exec();
  }

  async getCollectionDeviceByBayNumber(id: string, bayNumber: number) {
    const collection: CollectionDocument = await this.entiryModel
      .findOne({ identifier: id })
      .select({ devices: 1 })
      .populate({
        path: 'devices',
        select: 'identifier bayNumber status',
      })
      .lean();

    if (!collection) return null;
    return collection.devices.find((d) => d.bayNumber == bayNumber);
  }
}
