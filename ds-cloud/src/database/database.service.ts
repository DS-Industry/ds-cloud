import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as util from 'util';
import * as path from 'path';
import {
  MongooseModuleOptions,
  MongooseOptionsFactory,
} from '@nestjs/mongoose';

@Injectable()
export class DatabaseService implements MongooseOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  public getUrl(): string {
    const url = util.format(
      'mongodb://%s:%s@%s:%s/%s?replicaSet=%s&authSource=%s',
      this.configService.get<string>('DB_USER'),
      this.configService.get<string>('DB_PASSWORD'),
      [this.configService.get<string>('DB_HOST')].join(','),
      this.configService.get<string>('DB_PORT'),
      this.configService.get<string>('DB_SCHEMA'),
      'rs01',
      this.configService.get<string>('DB_NAME'),
    );

    return url;
  }

  public createMongooseOptions(): MongooseModuleOptions {
    return {
      uri: this.getUrl(),
      ssl: true,
      sslCA: path.join(__dirname, '..', '..', 'ssl', 'root.crt'),
    };
  }
}
