import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateVariableDto } from './dto/create-variable.dto';
import { UpdateVariableDto } from './dto/update-variable.dto';
import { DataType } from './enum/data-type.enum';
import { DefaultVariable } from './enum/default-variable.enum';
import { CreateDefaultVariableDto } from './dto/create-default-variable.dto';
import { VariableRepository } from './variable.repository';
import { DeviceService } from '../device/device.service';
import mongoose, { Types, ObjectId } from 'mongoose';
import { CreateGroupDefaultDto } from './dto/create-group-default.dto';

@Injectable()
export class VariableService {
  constructor(
    private readonly variableRepository: VariableRepository,
    private readonly deviceService: DeviceService,
  ) {}

  /**
   * Creating new variable. Variable is assigned to device
   * Each variable has type if value (Basic Types like string, int, float)
   * Type are check through helper function so in db you will type that matching variable value
   * @param createVariableDto
   */
  async create(createVariableDto: CreateVariableDto) {
    const device = await this.deviceService.findOne(createVariableDto.owner);

    if (!device)
      throw new NotFoundException(
        `Device with id ${createVariableDto.owner} not found`,
      );

    //Type checking helper function
    createVariableDto.value = this.checkDataType(
      createVariableDto.type,
      createVariableDto.value,
    );
    const variable = await this.variableRepository.create(createVariableDto);

    await this.deviceService.addVariable(device._id, variable._id);

    return variable;
  }

  /**
   * Create default variable for a device.
   * Working principle same as simple create method but
   * variables initialized automatically.
   * @param createDefaultVariable
   */
  async createDefault(createDefaultVariable: CreateDefaultVariableDto) {
    const device = await this.deviceService.findByIdentifier(
      createDefaultVariable.owner,
      { _id: 1 },
    );

    if (!device)
      throw new NotFoundException(
        `Device with id ${createDefaultVariable.owner} not found`,
      );

    const defaultVar = Object.values(DefaultVariable);

    for (const value1 of defaultVar) {
      const data = {
        name: value1,
        value: 0,
        owner: device._id,
        type: DataType.INT,
      };

      const variable = await this.variableRepository.create(data);
      await this.deviceService.addVariable(device._id, variable._id);
    }
    return { code: HttpStatus.OK, message: 'Success' };
  }

  async createGroupDefault(createGroupDefaultDto: CreateGroupDefaultDto) {
    const owners: string[] = createGroupDefaultDto.owners;
    let updatedCount = 0;
    const errorIdentifiers = [];

    for (const o of owners) {
      const device = await this.deviceService.findByIdentifier(o, { _id: 1 });
      if (!device) {
        errorIdentifiers.push(o);
        continue;
      }

      const defaultVar = Object.values(DefaultVariable);

      for (const value of defaultVar) {
        const data = {
          name: value,
          value: 0,
          owner: device._id,
          type: DataType.INT,
        };
        const variable = await this.variableRepository.create(data);
        await this.deviceService.addVariable(device._id, variable._id);
      }
      updatedCount++;
    }
    return {
      code: HttpStatus.OK,
      createdItems: updatedCount,
      errors: errorIdentifiers,
    };
  }
  /**
   * Getting all variables
   */
  async findAll() {
    return await this.variableRepository.findAll({});
  }

  /**
   * Getting all variables for specific device
   * @param id
   */
  async findAllByDevice(ownerId: string) {
    const variables = await this.variableRepository.findAll({
      owner: ownerId,
    });

    if (!variables)
      throw new NotFoundException(
        `Variables for device ${ownerId} are not found`,
      );
    return variables;
  }

  /**
   * Getting single variable by id
   * @param id
   */
  async findOne(id: string) {
    const variable = await this.variableRepository.findOneById(id);

    if (!variable)
      throw new NotFoundException(`Variables for device ${id} are not found`);
    return variable;
  }

  /**
   * Updating varaible by id.
   * Including type checking
   * @param id
   * @param updateVariableDto
   */
  async update(id: string, updateVariableDto: UpdateVariableDto) {
    const variable = await this.variableRepository.findOneAndUpdate(
      { _id: id },
      updateVariableDto,
    );

    if (!variable)
      throw new NotFoundException(
        `Update Error: Variable with this id ${id} not found`,
      );

    return variable;
  }

  /**
   * Updating variable by variable name
   * @param id
   * @param name
   * @param updateVariableDto
   */
  public async updateByDeviceId(
    deviceId: string,
    varName: string,
    updateVariableDto: UpdateVariableDto,
  ) {
    const variable = await this.variableRepository.findOneAndUpdate(
      { owner: deviceId, name: varName },
      updateVariableDto,
    );

    if (!variable)
      throw new NotFoundException(
        `Update Error: Variable with this owner id ${deviceId} not found`,
      );

    return variable;
  }

  /**
   * Remove variable by id
   * @param id
   */
  async remove(id: string) {
    const variable = await this.variableRepository.findOneById(id);

    if (!variable)
      throw new NotFoundException(
        `Delete Error: Variable with id ${id} not found`,
      );

    await this.deviceService.removeVariable(String(variable.owner), id);

    await variable.remove();

    return { code: HttpStatus.OK, message: 'Success' };
  }

  /**
   * Data type checking functions
   * Verifies if value is matching assigned data type
   * Data Types include: String, Float and Int
   * @param dataType
   * @param value
   */
  checkDataType(dataType: string, value: string) {
    let final;
    switch (dataType) {
      case DataType.INT:
        final = parseInt(value);
        if (isNaN(final))
          throw new HttpException(
            `Data Type error: types do not match: ${dataType} -- ${value}`,
            HttpStatus.BAD_REQUEST,
          );
        final = value.toString();
        break;
      case DataType.FLOAT:
        final = parseFloat(value);
        if (isNaN(final))
          throw new HttpException(
            `Data Type error: types do not match: ${dataType} -- ${value}`,
            HttpStatus.BAD_REQUEST,
          );
        final = value.toString();
        break;
      case DataType.STRING:
        final = value;
      default:
        break;
    }

    return final;
  }
}
