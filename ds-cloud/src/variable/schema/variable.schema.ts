import mongoose, {Document, model} from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Device } from '../../device/schema/device.schema';
import { DataType } from '../enum/data-type.enum';
export type VariableDocument = Variable & Document;

@Schema()
export class Variable {
  @Prop()
  name: string;

  @Prop()
  description: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'device'})
  owner: Device;

  @Prop()
  value: string;

  @Prop({ type: String, enum: DataType })
  type: DataType;

  @Prop()
  tag: string;
}
export const VariableSchema = SchemaFactory.createForClass(Variable);

export const VariableModel = model('variable', VariableSchema)