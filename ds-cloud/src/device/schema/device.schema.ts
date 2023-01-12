import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Variable } from '../../variable/schema/variable.schema';
import { Collection } from '../../app/collection/Schema/collection.schema';
import { DeviceStatus } from '../../common/enums/device-status.enum';

export type DeviceDocument = Device & Document;

@Schema({ collection: 'device' })
export class Device {
  @Prop()
  name: string;

  @Prop()
  identifier: string;

  @Prop()
  bayNumber: number;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Collection' })
  owner: Collection;

  @Prop()
  description: string;

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'Variable' })
  variables: Variable[];

  @Prop({ type: String, enum: DeviceStatus, default: DeviceStatus.UNAVAILABLE })
  status: DeviceStatus;

  @Prop()
  numberOfVariables: number;

  @Prop()
  registrationDate: Date;

  @Prop()
  lastUpdateDate: Date;
}
export const DeviceSchema = SchemaFactory.createForClass(Device);
