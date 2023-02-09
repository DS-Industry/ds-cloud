import { Module } from '@nestjs/common';
import { CollectionService } from './collection.service';
import { CollectionController } from './collection.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Collection, CollectionSchema } from './Schema/collection.schema';
import { CsvModule } from 'nest-csv-parser';
import { UserModule } from '../../user/user.module';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../../auth/guard/roles.guard';
import { CollectionRepository } from './collection.repository';
import {
  Integration,
  IntegrationSchema,
} from '../integrations/schema/integration.schema';
import { Service, ServiceSchema } from '../services/schema/service.schema';
import { PriceModule } from '@/app/price/price.module';

@Module({
  controllers: [CollectionController],
  providers: [
    CollectionService,
    CollectionRepository,
    JwtAuthGuard,
    RolesGuard,
  ],
  imports: [
    MongooseModule.forFeature([
      { name: Collection.name, schema: CollectionSchema },
      { name: Integration.name, schema: IntegrationSchema },
      { name: Service.name, schema: ServiceSchema },
    ]),
    CsvModule,
    UserModule,
    PriceModule,
  ],
  exports: [CollectionService],
})
export class CollectionModule {}
