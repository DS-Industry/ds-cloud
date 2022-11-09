import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { VariableService } from './variable.service';
import { CreateVariableDto } from './dto/create-variable.dto';
import { UpdateVariableDto } from './dto/update-variable.dto';
import { CreateDefaultVariableDto } from './dto/create-default-variable.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { CreateGroupDefaultDto } from './dto/create-group-default.dto';

@ApiTags('Variable')
@Controller('variable')
export class VariableController {
  constructor(private readonly variableService: VariableService) {}

  @Post()
  @ApiOperation({ summary: 'Create a variable for device' })
  @ApiCreatedResponse({ description: 'Created Successfully' })
  @ApiUnprocessableEntityResponse({ description: 'Bad Request' })
  @ApiConflictResponse({ description: 'Conflict Request' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @Roles(Role.USER, Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async create(@Body() createVariableDto: CreateVariableDto) {
    return await this.variableService.create(createVariableDto);
  }

  @Post('/default')
  @ApiOperation({ summary: 'Create a default variables for device' })
  @ApiCreatedResponse({ description: 'Created Successfully' })
  @ApiUnprocessableEntityResponse({ description: 'Bad Request' })
  @ApiConflictResponse({ description: 'Conflict Request' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @Roles(Role.USER, Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async createDefault(
    @Body() createDefaultVariableDto: CreateDefaultVariableDto,
  ) {
    return await this.variableService.createDefault(createDefaultVariableDto);
  }

  @Post('/default/group')
  @ApiOperation({ summary: 'Create a default variables for device' })
  @ApiCreatedResponse({ description: 'Created Successfully' })
  @ApiUnprocessableEntityResponse({ description: 'Bad Request' })
  @ApiConflictResponse({ description: 'Conflict Request' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @Roles(Role.USER, Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async createDefaultGroup(
    @Body() createDefaultGroupDto: CreateGroupDefaultDto,
  ) {
    return await this.variableService.createGroupDefault(createDefaultGroupDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all existing variables' })
  @ApiOkResponse({ description: 'The resource was returned successfully' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async findAll() {
    return await this.variableService.findAll();
  }

  @Get('device/:id')
  @ApiOperation({ summary: 'Find variable by device id' })
  @ApiParam({ name: 'id', required: true, type: 'int' })
  @ApiOkResponse({ description: 'The resource was updated successfully' })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @ApiUnprocessableEntityResponse({ description: 'Bad Request' })
  @Roles(Role.USER, Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async findAllByDevice(@Param('id') id: string) {
    return await this.variableService.findAllByDevice(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find variable by id' })
  @ApiParam({ name: 'id', required: true, type: 'int' })
  @ApiOkResponse({ description: 'The resource was updated successfully' })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @ApiUnprocessableEntityResponse({ description: 'Bad Request' })
  @Roles(Role.USER, Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async findOne(@Param('id') id: string) {
    return await this.variableService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update variable by id' })
  @ApiParam({ name: 'id', required: true, type: 'int' })
  @ApiOkResponse({ description: 'The resource was updated successfully' })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @ApiUnprocessableEntityResponse({ description: 'Bad Request' })
  @Roles(Role.USER, Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async update(
    @Param('id') id: string,
    @Body() updateVariableDto: UpdateVariableDto,
  ) {
    return await this.variableService.update(id, updateVariableDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete variable by id' })
  @ApiParam({ name: 'id', required: true, type: 'int' })
  @ApiOkResponse({ description: 'The resource was updated successfully' })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @Roles(Role.USER, Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async remove(@Param('id') id: string) {
    return await this.variableService.remove(id);
  }
}
