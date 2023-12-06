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
import {CollectionModel, CollectionSchema} from "@/app/collection/Schema/collection.schema";
import mongoose from 'mongoose'
import {Device, DeviceModel, DeviceSchema} from "@/device/schema/device.schema";
import {UserModel, UserSchema} from "@/user/schema/user.schema";
import {BrandModel, BrandSchema} from "@/app/brand/schema/brand.schema";
import {Integration, IntegrationModel, IntegrationSchema} from "@/app/integrations/schema/integration.schema";
import * as path from 'path';
import {PriceModel} from "@/app/price/schema/price.schema";
import {ServiceModel} from "@/app/services/schema/service.schema";
import {TagModel} from "@/app/tags/Schema/tags.schema";
import {VariableModel} from "@/variable/schema/variable.schema";
import {UserJsModel} from "@/userAdminJs";
import * as bcrypt from 'bcryptjs';
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


    await mongoose.connect('mongodb://cwash:Daster14@rc1a-457hoykx92586xdl.mdb.yandexcloud.net:27018/cloud-core-dev?replicaSet=rs01&authSource=cloud-core-dev', {
        ssl: true,
        sslCA: path.join(__dirname, '..', 'ssl', 'root.crt'),
    })
    const { AdminJS, AdminJSExpress, AdminJSMongoose } = await preloadAdminJSModules();
    const canModifyUsers = ({ currentAdmin }) => currentAdmin && currentAdmin.role === 'admin'
    const adminOptions = {
        // We pass Category to `resources`
        resources: [
            IntegrationModel,
            {resource: PriceModel,
                options: {
                    properties: {
                        costType:{
                            isRequired: true,
                        },
                        service:{
                            isRequired: true,
                        },
                        collectionId: {
                            description: 'Id - как в CW',
                        },
                    }
                }
            },
            BrandModel,
            {resource: CollectionModel,
                options: {
                    properties: {
                        owner: {
                            isRequired: true,
                        },
                        identifier: {
                            description: 'Id - как в CW',
                        },
                        address: {
                            isRequired: true,
                        },
                        lat: {
                            isRequired: true,
                            description: 'Широта',
                        },
                        lon: {
                            isRequired: true,
                            description: 'Долгота',
                        },
                    }
                }
            },
            ServiceModel,
            TagModel,
            {resource: DeviceModel,
                options: {
                    properties: {
                        name: {
                            isRequired: true,
                            isTitle: false,
                        },
                        identifier: {
                            isRequired: true,
                            isTitle: true,
                            description: 'Id - как в CW',
                        },
                        bayNumber: {
                            isRequired: true,
                        },
                        owner: {
                            isRequired: true,
                            description: 'Мойка',
                        },
                    }
                }
            },
            UserModel,
            { resource:VariableModel,
                options: {
                    properties: {
                        name: {
                            isTitle: false,
                            availableValues: [
                                { value: 'GVLSum', label: 'GVLSum' },
                                { value: 'GVLErr', label: 'GVLErr' },
                                { value: 'GVLCardNum', label: 'GVLCardNum' },
                                { value: 'GVLCardSum', label: 'GVLCardSum' },
                                { value: 'GVLTime', label: 'GVLTime' },
                                { value: 'GVLSource', label: 'GVLSource' },
                            ],
                        },
                        owner: {
                            isTitle: true,
                        },
                    }
                }
            },
            { resource: UserJsModel,
                options: {
                    properties: {
                        encryptedPassword: {
                            isVisible: false,
                        },
                        password: {
                            type: 'string',
                            isVisible: {
                                list: false, edit: true, filter: false, show: false,
                            },
                        },
                    },
                    actions: {
                        new: {
                            isAccessible: canModifyUsers,
                            isVisible: canModifyUsers,
                            before: async (request) => {
                                if(request.payload.password) {
                                    request.payload = {
                                        ...request.payload,
                                        encryptedPassword: await bcrypt.hash(request.payload.password, 10),
                                        password: undefined,
                                    }
                                }
                                return request
                            },
                        },
                        edit: { isAccessible: canModifyUsers, isVisible: canModifyUsers},
                        delete: { isAccessible: canModifyUsers, isVisible: canModifyUsers},
                        show: { isAccessible: canModifyUsers, isVisible: canModifyUsers},
                        bulkDelete: { isAccessible: canModifyUsers, isVisible: canModifyUsers},
                    },
                }
            }
        ],
        rootPath: '/admin',
    }

    const admin = new AdminJS.default(adminOptions);

    const adminRouter = AdminJSExpress.default.buildAuthenticatedRouter(admin, {
        authenticate: async (email, password) => {
            const user = await UserJsModel.findOne({ email })
            if (user) {
                const matched = await bcrypt.compare(password, user.encryptedPassword)
                if (matched) {
                    return user
                }
            }
            return false
        },
        cookiePassword: 'some-secret-password-used-to-secure-cookie',
    });
    app.use(admin.options.rootPath, adminRouter);

  await app.listen(process.env.APP_PORT || 3000);

}
bootstrap();
