import { Injectable } from '@nestjs/common';
import { MongoGenericRepository } from '@/core/repository/mongo-generic.repository';
import { Type, TypeDocument } from '@/app/types/schema/type.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class TypeRepository extends MongoGenericRepository<TypeDocument> {
  constructor(@InjectModel(Type.name) typeModel: Model<TypeDocument>) {
    super(typeModel);
  }
}
