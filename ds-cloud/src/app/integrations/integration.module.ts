import { Module } from '@nestjs/common';
import { IntegrationService } from '@/app/integrations/integration.service';
import { CollectionModule } from '@/app/collection/collection.module';
import { PriceModule } from '@/app/price/price.module';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Integration,
  IntegrationSchema,
} from '@/app/integrations/schema/integration.schema';
import { IntegrationRepository } from '@/app/integrations/integration.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Integration.name, schema: IntegrationSchema },
    ]),
    CollectionModule,
    PriceModule,
  ],
  controllers: [],
  providers: [IntegrationService, IntegrationRepository],
  exports: [],
})
export class IntegrationModule {}
