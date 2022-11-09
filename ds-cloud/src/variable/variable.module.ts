import { Module } from '@nestjs/common';
import { VariableService } from './variable.service';
import { VariableController } from './variable.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Variable, VariableSchema } from './schema/variable.schema';
import { Device, DeviceSchema } from '../device/schema/device.schema';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { VariableRepository } from './variable.repository';
import { DeviceModule } from '../device/device.module';

@Module({
  controllers: [VariableController],
  providers: [VariableService, VariableRepository, JwtAuthGuard, RolesGuard],
  imports: [
    MongooseModule.forFeature([
      { name: Variable.name, schema: VariableSchema },
      { name: Device.name, schema: DeviceSchema },
    ]),
    DeviceModule,
  ],
  exports: [VariableService],
})
export class VariableModule {}
