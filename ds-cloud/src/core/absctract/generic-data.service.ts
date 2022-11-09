import { IGenericRepository } from './generic-repository.interface';
import { User } from '../../user/schema/user.schema';
import { Device } from '../../device/schema/device.schema';
import { Collection } from '../../collection/Schema/collection.schema';
import { Variable } from '../../variable/schema/variable.schema';

export abstract class IDataService {
  abstract user: IGenericRepository<User>;
  abstract variable: IGenericRepository<Variable>;
  abstract device: IGenericRepository<Device>;
  abstract collection: IGenericRepository<Collection>;
}
