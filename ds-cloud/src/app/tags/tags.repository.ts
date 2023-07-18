import { Injectable } from '@nestjs/common';
import { MongoGenericRepository } from '@/core/repository/mongo-generic.repository';
import { Tag, TagsDocument } from '@/app/tags/Schema/tags.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class TagsRepository extends MongoGenericRepository<TagsDocument> {
  constructor(@InjectModel(Tag.name) tagModel: Model<TagsDocument>) {
    super(tagModel);
  }

}
