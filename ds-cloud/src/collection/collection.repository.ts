import { Injectable } from '@nestjs/common';
import { MongoGenericRepository } from '../core/repository/mongo-generic.repository';
import { Collection, CollectionDocument } from './Schema/collection.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class CollectionRepository extends MongoGenericRepository<CollectionDocument> {
  constructor(@InjectModel(Collection.name) collectionModel: Model<CollectionDocument>) {
    super(collectionModel);
  }
}
