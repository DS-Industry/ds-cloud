import { Module } from '@nestjs/common';
import { PriceService } from './price.service';
import { PriceController } from './price.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Price, PriceSchema } from './schema/price.schema';
import { CollectionModule } from '@/app/collection/collection.module';
import { PriceRepository } from '@/app/price/price.repository';
import { ServicesModule } from '@/app/services/services.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Price.name, schema: PriceSchema }]),
    ServicesModule,
  ],
  controllers: [PriceController],
  providers: [PriceService, PriceRepository],
  exports: [PriceService],
})
export class PriceModule {}
