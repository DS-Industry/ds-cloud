import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import * as basicAuth from 'express-basic-auth';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as compression from 'compression';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { NestExpressApplication } from '@nestjs/platform-express';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import express from 'express'
import {model} from "mongoose";
import {CollectionModel, CollectionSchema} from "@/app/collection/Schema/collection.schema";
import mongoose from 'mongoose'
import {DatabaseService} from "@/database/database.service";
import {DeviceModel, DeviceSchema} from "@/device/schema/device.schema";
import {UserModel, UserSchema} from "@/user/schema/user.schema";
import {BrandModel, BrandSchema} from "@/app/brand/schema/brand.schema";
import {Integration, IntegrationModel, IntegrationSchema} from "@/app/integrations/schema/integration.schema";
import * as util from 'util';
import * as path from 'path';
import {PriceModel} from "@/app/price/schema/price.schema";
import {ServiceModel} from "@/app/services/schema/service.schema";
import {TagModel} from "@/app/tags/Schema/tags.schema";
import {VariableModel} from "@/variable/schema/variable.schema";

async function preloadAdminJSModules() {
    const [AdminJS, AdminJSExpress, AdminJSMongoose] = await Promise.all([
        import('adminjs'),
        import('@adminjs/express'),
        import('@adminjs/mongoose'),
    ]);

    AdminJS.default.registerAdapter({
        Resource: AdminJSMongoose.Resource,
        Database: AdminJSMongoose.Database,
    });
    return { AdminJS, AdminJSExpress, AdminJSMongoose };
}
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(
    new AllExceptionsFilter(app.get(WINSTON_MODULE_NEST_PROVIDER)),
  );
  app.setGlobalPrefix('/api/v1/');
  app.use(compression());
  app.enable('trust proxy');

  //Swagger auth
  app.use(
    ['/api/v1/docs'],
    basicAuth({
      challenge: true,
      users: {
        admin: process.env.SWAGGER_ADMIN_PWD,
        dev: process.env.SWAGGER_DEV_PWD,
      },
    }),
  );

  const options = new DocumentBuilder()
    .setTitle(`${process.env.APP_NAME} API`)
    .setBasePath('/api/v1/')
    .setDescription(`${process.env.APP_NAME} api`)
    .setVersion('1.0.0')
    .addApiKey(
      {
        type: 'apiKey',
        name: 'akey',
        in: 'header',
        description: 'Enter your API key',
      },
      'x-api-key',
    )
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api/v1/docs', app, document);

  app.use(cookieParser());


    await mongoose.connect('mongodb://cwash:Daster14@rc1a-457hoykx92586xdl.mdb.yandexcloud.net:27018/cloud-core-prod?replicaSet=rs01&authSource=cloud-core-prod', {
        ssl: true,
        sslCA: path.join(__dirname, '..', 'ssl', 'root.crt'),
    })
    const { AdminJS, AdminJSExpress, AdminJSMongoose } = await preloadAdminJSModules();
    const adminOptions = {
        // We pass Category to `resources`
        resources: [IntegrationModel, CollectionModel, BrandModel, PriceModel, ServiceModel, TagModel, DeviceModel, UserModel, VariableModel],
    }

    const admin = new AdminJS.default(adminOptions);

    const adminRouter = AdminJSExpress.default.buildRouter(admin);
    app.use(admin.options.rootPath, adminRouter);

  await app.listen(process.env.APP_PORT || 3000);

}
bootstrap();
