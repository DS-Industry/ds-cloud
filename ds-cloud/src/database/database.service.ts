import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  MongooseModuleOptions,
  MongooseOptionsFactory,
} from '@nestjs/mongoose';

@Injectable()
export class DatabaseService implements MongooseOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  public getUrl(): string {
    const user = encodeURIComponent(this.configService.get<string>('DB_USER'));
    const password = encodeURIComponent(
      this.configService.get<string>('DB_PASSWORD'),
    );
    const host = this.configService.get<string>('DB_HOST');
    const port = this.configService.get<string>('DB_PORT');
    const db = this.configService.get<string>('DB_SCHEMA');

    return `mongodb://${user}:${password}@${host}:${port}/${db}?authSource=admin&directConnection=true`;
  }

  public createMongooseOptions(): MongooseModuleOptions {
    return {
      uri: this.getUrl(),
    };
  }
}
