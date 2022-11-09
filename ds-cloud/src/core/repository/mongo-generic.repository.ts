import { IGenericRepository } from '../absctract/generic-repository.interface';
import mongoose, { Document, FilterQuery, Model, UpdateQuery } from 'mongoose';

export abstract class MongoGenericRepository<T extends mongoose.Document>
  implements IGenericRepository<T>
{
  protected constructor(protected readonly entiryModel: Model<T>) {}

  async create(item: unknown): Promise<T> {
    const entity = new this.entiryModel(item);
    return entity.save();
  }

  async findAll(
    entityFilterQuery: FilterQuery<T>,
    populateOnFind: string[] = [],
  ): Promise<T[] | null> {
    return this.entiryModel.find(entityFilterQuery).exec();
  }

  async findOneAndUpdate(
    entityFilterQuery: FilterQuery<T>,
    item: UpdateQuery<unknown>,
  ): Promise<T | null> {
    return this.entiryModel.findOneAndUpdate(entityFilterQuery, item, {
      new: true,
    });
  }

  async findOneByFilter(
    entityFilterQuery: FilterQuery<T>,
    selectOptions: any = {},
    populateOnFind: string[] = [],
  ): Promise<T | null> {
    return await this.entiryModel
      .findOne(entityFilterQuery)
      .select(selectOptions)
      .exec();
  }

  async findOneById(
    id: string,
    populateOnFind: string[] = [],
  ): Promise<T | null> {
    return this.entiryModel.findById(id).exec();
  }

  async removeMany(entityFilterQuery: FilterQuery<T>): Promise<boolean> {
    const result = await this.entiryModel.deleteMany(entityFilterQuery);
    return result.deletedCount >= 1;
  }
}
