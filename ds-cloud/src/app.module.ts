import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DeviceModule } from './device/device.module';
import { VariableModule } from './variable/variable.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { CollectionModule } from './app/collection/collection.module';
import { MulterModule } from '@nestjs/platform-express';
import { ExternalModule } from './external/external.module';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { DatabaseModule } from './database/database.module';
import { DatabaseService } from './database/database.service';
import * as winston from 'winston';
import { Logtail } from '@logtail/node';
import { WinstonModule } from 'nest-winston';
import { LogtailTransport } from '@logtail/winston';
import { ServicesModule } from './app/services/services.module';
import { PriceModule } from './app/price/price.module';
import { TagsModule } from './app/tags/tags.module';
import { BrandModule } from './app/brand/brand.module';
import { TypesModule } from './app/types/types.module';
import {CollectionSchema} from "@/app/collection/Schema/collection.schema";
import mongoose, {model} from "mongoose";
import {resources} from "@opentelemetry/sdk-node";


const logtail = new Logtail('H8oAoz3TQm3CFZLp6HbUD64j');

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
    }),
    MongooseModule.forRootAsync({
      imports: [DatabaseModule],
      useClass: DatabaseService,
    }),
    WinstonModule.forRoot({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
      transports: [new LogtailTransport(logtail)],
    }),
    DeviceModule,
    VariableModule,
    UserModule,
    AuthModule,
    CollectionModule,
    MulterModule.register({
      dest: './uploads',
    }),
    ExternalModule,
    DatabaseModule,
    ServicesModule,
    PriceModule,
    TagsModule,
    TypesModule,
  ],
  controllers: [],
  providers: [],
})


export class AppModule {}
