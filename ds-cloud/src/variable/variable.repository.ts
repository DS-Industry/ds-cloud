import { MongoGenericRepository } from '../core/repository/mongo-generic.repository';
import { Variable, VariableDocument } from './schema/variable.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

export class VariableRepository extends MongoGenericRepository<VariableDocument> {
  constructor(
    @InjectModel(Variable.name) variableModel: Model<VariableDocument>,
  ) {
    super(variableModel);
  }
}
