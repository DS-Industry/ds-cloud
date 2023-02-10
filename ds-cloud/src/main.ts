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
import helmet from 'helmet';

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

  await app.listen(process.env.APP_PORT || 3000);
}
bootstrap();
