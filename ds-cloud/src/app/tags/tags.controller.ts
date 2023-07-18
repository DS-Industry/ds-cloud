import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { TagsService } from '@/app/tags/tags.service';
import { Roles } from '@/auth/decorators/roles.decorator';
import { Role } from '@/common/enums';
import { JwtAuthGuard } from '@/auth/guard/jwt-auth.guard';
import { RolesGuard } from '@/auth/guard/roles.guard';
import { CreateTag } from '@/app/tags/dto/req/createTag.dto';

@Controller('tag')
export class TagController {
  constructor(private readonly tagService: TagsService) {}

  @Post()
  @Roles(Role.USER, Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async create(@Body() body: CreateTag) {
    return await this.tagService.create(body.name, body.color);
  }
}
