import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Tag, TagSchema } from '@/app/tags/Schema/tags.schema';
import { TagsService } from '@/app/tags/tags.service';
import { TagsRepository } from '@/app/tags/tags.repository';
import { TagController } from '@/app/tags/tags.controller';

@Module({
  controllers: [TagController],
  providers: [TagsService, TagsRepository],
  imports: [MongooseModule.forFeature([{ name: Tag.name, schema: TagSchema }])],
  exports: [TagsService],
})
export class TagsModule {}
