import mongoose, { FilterQuery } from 'mongoose';

export interface IGenericRepository<T> {
  create(item: unknown): Promise<T>;
  findAll(
    entityFilterQuery: FilterQuery<T>,
    populateOnFind: string[],
  ): Promise<T[] | null>;
  findOneById(id: string, populateOnFind: string[]): Promise<T | null>;
  findOneByFilter(
    entityFilterQuery: FilterQuery<T>,
    selectOptions: any,
    populateOnFind: string[],
  ): Promise<T | null>;
  findOneAndUpdate(
    entityFilterQuery: FilterQuery<T>,
    item: T,
  ): Promise<T | null>;
  removeMany(entityFilterQuery: FilterQuery<T>): Promise<boolean>;
}
