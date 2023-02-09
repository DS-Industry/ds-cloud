import { Injectable } from '@nestjs/common';
import { MongoGenericRepository } from '@/core/repository/mongo-generic.repository';
import {
  Integration,
  IntegrationDocument,
} from '@/app/integrations/schema/integration.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class IntegrationRepository extends MongoGenericRepository<IntegrationDocument> {
  constructor(
    @InjectModel(Integration.name) integrationModel: Model<IntegrationDocument>,
  ) {
    super(integrationModel);
  }
}
