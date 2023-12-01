import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, {Document, model} from 'mongoose';
import { Variable } from '../../variable/schema/variable.schema';
import { Collection } from '../../app/collection/Schema/collection.schema';
import { DeviceStatus } from '../../common/enums/device-status.enum';
import { DeviceType } from '@/common/enums/device-type.enum';

export type DeviceDocument = Device & Document;

@Schema({ collection: 'device' })
export class Device {
  @Prop()
  name: string;

  @Prop()
  identifier: string;

  @Prop()
  bayNumber: number;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'collection' })
  owner: Collection;

  @Prop()
  description: string;

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'variable' })
  variables: Variable[];

  @Prop({ type: String, enum: DeviceStatus, default: DeviceStatus.UNAVAILABLE })
  status: DeviceStatus;

  @Prop()
  numberOfVariables: number;

  @Prop()
  registrationDate: Date;

  @Prop()
  lastUpdateDate: Date;

  @Prop({ type: String, enum: DeviceType })
  type: DeviceType;
}
export const DeviceSchema = SchemaFactory.createForClass(Device);

export const DeviceModel = model('device', DeviceSchema)