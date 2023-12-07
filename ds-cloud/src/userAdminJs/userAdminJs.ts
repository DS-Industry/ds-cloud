import {model} from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class UserJs {

    @Prop({ required: true })
    email: string;

    @Prop({required: true })
    encryptedPassword: string;

    @Prop({enum: ['admin', 'restricted'], required: true} )
    role: string;
}

export const UserJsSchema = SchemaFactory.createForClass(UserJs);

export const UserJsModel = model('userJs', UserJsSchema)