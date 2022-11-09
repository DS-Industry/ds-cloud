import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Variable } from '../../variable/schema/variable.schema';
import { Collection } from '../../collection/Schema/collection.schema';

export type DeviceDocument = Device & Document;

@Schema({ collection: 'device' })
export class Device {
  @Prop()
  name: string;

  @Prop()
  identifier: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Collection' })
  owner: Collection;

  @Prop()
  description: string;

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'Variable' })
  variables: Variable[];

  @Prop()
  status: number;

  @Prop()
  numberOfVariables: number;

  @Prop()
  registrationDate: Date;

  @Prop()
  lastUpdateDate: Date;
}
export const DeviceSchema = SchemaFactory.createForClass(Device);
