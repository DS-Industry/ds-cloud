import { Module } from '@nestjs/common';
import { TypesService } from './types.service';
import { TypesController } from './types.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {Type, TypeSchema} from '@/app/types/schema/type.entity';
import { TypeRepository } from '@/app/types/type.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Type.name, schema: TypeSchema }]),
  ],
  controllers: [TypesController],
  providers: [TypesService, TypeRepository],
})
export class TypesModule {}
