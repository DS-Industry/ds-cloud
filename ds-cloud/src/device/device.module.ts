import { Module } from '@nestjs/common';
import { DeviceService } from './device.service';
import { DeviceController } from './device.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Device, DeviceSchema } from './schema/device.schema';
import { CollectionModule } from '../collection/collection.module';
import { CsvModule } from 'nest-csv-parser';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { DeviceRepository } from './device.repository';
import { VariableModule } from '../variable/variable.module';

@Module({
  controllers: [DeviceController],
  providers: [DeviceService, DeviceRepository, JwtAuthGuard, RolesGuard],
  imports: [
    MongooseModule.forFeature([{ name: Device.name, schema: DeviceSchema }]),
    CollectionModule,
    CsvModule,
  ],
  exports: [DeviceService],
})
export class DeviceModule {}
