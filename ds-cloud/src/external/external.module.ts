import { Module } from '@nestjs/common';
import { ExternalService } from './external.service';
import { ExternalController } from './external.controller';
import { DeviceModule } from '../device/device.module';
import { VariableModule } from '../variable/variable.module';
import { ApiKeyGuard } from '../auth/guard/api-key.guard';
import { MongooseModule } from '@nestjs/mongoose';
import { Device, DeviceSchema } from '../device/schema/device.schema';
import { Variable, VariableSchema } from '../variable/schema/variable.schema';
import { CollectionModule } from '../app/collection/collection.module';
import {
  Collection,
  CollectionSchema,
} from '@/app/collection/Schema/collection.schema';
import { Price, PriceSchema } from '@/app/price/schema/price.schema';
import { Service, ServiceSchema } from '@/app/services/schema/service.schema';

@Module({
  controllers: [ExternalController],
  providers: [ExternalService, ApiKeyGuard],
  imports: [
    MongooseModule.forFeature([
      { name: Variable.name, schema: VariableSchema },
      { name: Device.name, schema: DeviceSchema },
      { name: Collection.name, schema: CollectionSchema },
      { name: Price.name, schema: PriceSchema },
      { name: Service.name, schema: ServiceSchema },
    ]),
    CollectionModule,
    DeviceModule,
    VariableModule,
  ],
})
export class ExternalModule {}
