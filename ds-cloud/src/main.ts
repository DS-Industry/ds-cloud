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
import mongoose from 'mongoose'
const adminOptions = require('./adminJs/admin-options');
import {UserJsModel} from "@/adminJs/userAdminJs";
import * as bcrypt from 'bcryptjs';
import {DatabaseService} from "@/database/database.service";
/*const session = require('express-session');
const MongoStore = require('connect-mongo');*/
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
  /*app.use(session({
      secret: 'some-secret-password-used-to-secure-cookie',
      cookie: {
          httpOnly: false,
          secure: false,
      },
      store: MongoStore.create({
          mongoUrl: mongooseOptions.uri,
          MongoOptions:{
              server: {
                  ssl: mongooseOptions.ssl,
                  sslCA: mongooseOptions.sslCA,
              }
          }
      }),
      resave: false,
      saveUninitialized: false,
  }))*/



    const { AdminJS, AdminJSExpress, AdminJSMongoose } = await preloadAdminJSModules();
    const dataService = app.get(DatabaseService);
    const mongooseOptions = dataService.createMongooseOptions();
    const admin = new AdminJS.default(adminOptions);

    await mongoose.connect(mongooseOptions.uri, {
        ssl: mongooseOptions.ssl,
        sslCA: mongooseOptions.sslCA,
    })
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
    }/*, null, <null>{
        secret: 'some-secret-password-used-to-secure-cookie',
        cookie: {
            httpOnly: false,
            secure: false,
        },
        store: MongoStore.create({
            mongoUrl: mongooseOptions.uri,
            MongoOptions:{
                server: {
                    ssl: mongooseOptions.ssl,
                    sslCA: mongooseOptions.sslCA,
                }
            }
        }),
        resave: false,
        saveUninitialized: false,
    }*/);
    app.use(admin.options.rootPath, adminRouter);

  await app.listen(process.env.APP_PORT || 3000);
}
bootstrap();
