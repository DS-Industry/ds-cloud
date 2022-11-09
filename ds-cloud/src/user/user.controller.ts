import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { Role } from '../common/enums/role.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { AssignRoleDto } from './dto/assign-role.dto';
import { RolesGuard } from '../auth/guard/roles.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiExcludeEndpoint,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get all existing users' })
  @ApiOkResponse({ description: 'The resource was returned successfully' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find user by id' })
  @ApiParam({ name: 'id', required: true, type: 'int' })
  @ApiOkResponse({ description: 'The resource was updated successfully' })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @ApiUnprocessableEntityResponse({ description: 'Bad Request' })
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch()
  @ApiExcludeEndpoint()
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  update(@Body() updateUserDto: UpdateUserDto, @Req() request) {
    const { user } = request;
    return this.userService.update(user._id, updateUserDto);
  }

  @Post('/role/:id')
  @ApiOperation({ summary: 'Assign role to user' })
  @ApiParam({ name: 'id', required: true, type: 'int' })
  @ApiCreatedResponse({ description: 'Created Successfully' })
  @ApiUnprocessableEntityResponse({ description: 'Bad Request' })
  @ApiConflictResponse({ description: 'Conflict Request' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  assignRole(@Body() assignRoleDto: AssignRoleDto, @Param('id') id: string) {
    return this.userService.assignRole(id, assignRoleDto);
  }

  @Get('/apiKey/get')
  @ApiOperation({ summary: 'Get your api key' })
  @ApiOkResponse({ description: 'The resource was updated successfully' })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @ApiUnprocessableEntityResponse({ description: 'Bad Request' })
  @Roles(Role.DEV, Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  getApiKey(@Req() req) {
    const { user } = req;
    return this.userService.getApiKeyByUserId(user);
  }

  @Delete('/role/:id')
  @ApiOperation({ summary: 'Delete user by id' })
  @ApiParam({ name: 'id', required: true, type: 'int' })
  @ApiOkResponse({ description: 'The resource was updated successfully' })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  removeRole(@Body() assignRoleDto: AssignRoleDto, @Param('id') id: string) {
    return this.userService.removeRole(id, assignRoleDto);
  }
}
