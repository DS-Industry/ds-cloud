import { DeviceStatus } from '../../../../common/enums/device-status.enum';
import { CostType } from '../../../../common/enums/cost-type.enum';

class Location {
  lat: number;
  lon: number;
}

class Boxes {
  id: string;
  number: number;
  status: DeviceStatus;
}

class Price {
  id: string;
  name: string;
  description: string;
  cost: number;
  costType: CostType;
}

export class GetAllCollectionsResponse {
  id: string;
  name: string;
  isActive: boolean;
  address: string;
  location: Location;
  boxes: Boxes[];
  price: Price[];
}
