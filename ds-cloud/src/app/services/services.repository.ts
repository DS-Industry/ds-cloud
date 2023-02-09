import { Injectable } from '@nestjs/common';
import { MongoGenericRepository } from '@/core/repository/mongo-generic.repository';
import { Service, ServiceDocument } from '@/app/services/schema/service.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class ServicesRepository extends MongoGenericRepository<ServiceDocument> {
  constructor(@InjectModel(Service.name) serviceModel: Model<ServiceDocument>) {
    super(serviceModel);
  }

  async findServicesListByIds(servicesId: number[]) {
    return this.entiryModel.find({ id: { $in: servicesId } });
  }
}
