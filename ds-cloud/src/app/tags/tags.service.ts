import { Injectable } from '@nestjs/common';
import { TagsRepository } from '@/app/tags/tags.repository';
import { Tag } from '@/app/tags/Schema/tags.schema';

@Injectable()
export class TagsService {
  constructor(private readonly tagsRepository: TagsRepository) {}

  /**
   * Create new instance of tag
   */
  async create(name: string, color: string): Promise<any> {
    return await this.tagsRepository.create({ name, color });
  }

  /**
   * Find one by name
   */
  async findOneByName(name: string): Promise<any> {
    return await this.tagsRepository.findOneByFilter({
      name: name,
    });
  }

  async findOneByOptions(options: object): Promise<any> {
    return await this.tagsRepository.findByOptions(options);
  }
}
