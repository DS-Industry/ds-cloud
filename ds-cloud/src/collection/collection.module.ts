import { Module } from '@nestjs/common';
import { CollectionService } from './collection.service';
import { CollectionController } from './collection.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Collection, CollectionSchema } from './Schema/collection.schema';
import { CsvModule } from 'nest-csv-parser';
import { UserModule } from '../user/user.module';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { CollectionRepository } from './collection.repository';

@Module({
  controllers: [CollectionController],
  providers: [
    CollectionService,
    CollectionRepository,
    JwtAuthGuard,
    RolesGuard,
  ],
  imports: [
    MongooseModule.forFeature([
      { name: Collection.name, schema: CollectionSchema },
    ]),
    CsvModule,
    UserModule,
  ],
  exports: [CollectionService],
})
export class CollectionModule {}
