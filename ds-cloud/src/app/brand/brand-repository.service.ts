import { Injectable } from '@nestjs/common';
import { MongoGenericRepository } from '@/core/repository/mongo-generic.repository';
import { Brand, BrandDocument } from '@/app/brand/schema/brand.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class BrandRepository extends MongoGenericRepository<BrandDocument> {
  constructor(@InjectModel(Brand.name) brandModel: Model<BrandDocument>) {
    super(brandModel);
  }
}
