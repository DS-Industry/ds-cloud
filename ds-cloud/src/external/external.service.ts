import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  LoggerService,
} from '@nestjs/common';
import { ExternalMobileWriteRequest } from './dto/write-mobile-external.dto';
import { DeviceService } from '../device/device.service';
import { VariableService } from '../variable/variable.service';
import { UpdateVariableDto } from '../variable/dto/update-variable.dto';
import { Variable, VariableDocument } from '../variable/schema/variable.schema';
import * as moment from 'moment';
import {
  BusyBayExceptions,
  DeviceInternalException,
  DeviceNetworkException,
} from '../common/exceptions';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Device, DeviceDocument } from '../device/schema/device.schema';

@Injectable()
export class ExternalService {
  constructor(
    @InjectModel(Variable.name) private variableModel: Model<VariableDocument>,
    @InjectModel(Device.name) private deviceModel: Model<DeviceDocument>,
    private readonly deviceService: DeviceService,
    private readonly variableService: VariableService,
  ) {}

  /**
   * Writing data to variables documents
   * Data is received from the controller
   * With interval of 10 seconds
   * Returning current data variables before updating db
   * @param id
   * @param data
   */
  public async writeControllerData(id: string, data: any) {
    console.log('Writing data start...');
    const bulkOps = [];
    const res = {};
    const updateTime = new Date();

    const device = await this.deviceModel
      .findOne({ identifier: id })
      .select({ _id: 1, lastUpdateDate: 1 });

    const currentVar: any[] = await this.variableModel
      .find({ owner: device._id })
      .select({ name: 1, value: 1 })
      .lean();

    if (currentVar.length == 0)
      throw new HttpException(
        'No variables found for this device',
        HttpStatus.NOT_FOUND,
      );

    for (let i = 0; i < data.length; i++) {
      const item = data[i].split(':');
      const match = currentVar.find((element) => element.name === item[0]);

      if (match.value !== item[1]) {
        bulkOps.push({
          updateOne: {
            filter: { owner: device._id, name: item[0] },
            update: {
              value: item[1],
            },
            upsert: true,
          },
        });
      }
      res[currentVar[i].name] = currentVar[i].value;
    }

    if (bulkOps.length > 0) {
      await this.variableModel.bulkWrite(bulkOps);
    }

    device.lastUpdateDate = updateTime;
    await device.save();

    return res;
  }

  /**
   * Writing data to variables documents
   * Data is received from mobile application
   * Request comes when user tries to turn on the equipment
   * Returning current data variables before updating db
   * @param id
   * @param data
   */
  public async writeMobileData(id: string, data: ExternalMobileWriteRequest) {
    const bulkOps = [];
    const device = await this.deviceModel
      .findOne({ identifier: id })
      .select({ _id: 1, lastUpdateDate: 1 });

    const currentVar: any[] = await this.variableModel
      .find({ owner: device._id })
      .select({ name: 1, value: 1 })
      .lean();

    if (currentVar.length == 0)
      throw new HttpException(
        'No variables found for this device',
        HttpStatus.NOT_FOUND,
      );
    //If device is busy returning error
    currentVar.map((item) => {
      if (item.name == 'GVLErr' && parseInt(item.value) > 0) {
        throw new DeviceInternalException(device._id);
      } else if (item.name == 'GVLTime' && parseInt(item.value) > 0) {
        throw new BusyBayExceptions(device._id);
      } else if (item.name == 'GVLSum' && parseInt(item.value) > 0) {
        throw new BusyBayExceptions(device._id);
      } else if (moment().diff(device.lastUpdateDate, 'minutes') >= 3) {
        throw new DeviceNetworkException(device._id);
      }
    });

    for (const item of Object.entries(data)) {
      bulkOps.push({
        updateOne: {
          filter: { owner: device._id, name: item[0] },
          update: {
            value: item[1],
          },
          upsert: true,
        },
      });
    }

    if (bulkOps.length > 0) {
      await this.variableModel.bulkWrite(bulkOps);
    }
    return currentVar;
  }

  /**
   * Write data method finds variables by name
   * update with new values
   * @param newData
   */
  public async writeData(newData: any, deviceId: string): Promise<Variable[]> {
    const successUpdates = [];
    const updateVariableDto: UpdateVariableDto = new UpdateVariableDto();

    for (const item of Object.entries(newData)) {
      updateVariableDto.value = item[1];
      const updItem = await this.variableService.updateByDeviceId(
        deviceId,
        item[0],
        updateVariableDto,
      );
      successUpdates.unshift(updItem);
    }

    return successUpdates;
  }
}
