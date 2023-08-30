import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { MongoGenericRepository } from '@/core/repository/mongo-generic.repository';
import { Price, PriceDocument } from '@/app/price/schema/price.schema';
import { Model } from 'mongoose';
import { BulkWriteResult } from '@/common/dto/bulk-write-result.dto';

@Injectable()
export class PriceRepository extends MongoGenericRepository<PriceDocument> {
  constructor(@InjectModel(Price.name) priceModel: Model<PriceDocument>) {
    super(priceModel);
  }

  async batchInsert(bulkIns: any[]): Promise<BulkWriteResult> {
    const bulkWriteResult: BulkWriteResult = new BulkWriteResult();
    const result = await this.entiryModel.bulkWrite(bulkIns);
    return Object.assign(bulkWriteResult, result.result);
  }

  async updateOne(collectionId, serviceId, updateFields: any) {
    return this.entiryModel.updateOne(
      { collectionId, serviceId },
      { $set: updateFields },
    );
  }
}
