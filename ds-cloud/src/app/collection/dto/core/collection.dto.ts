import { Price } from '@/app/price/dto/core/price.dto';
import { Boxes } from '@/app/collection/dto/core/boxes.dto';

class IndividualFiscalData {
  inn: string | null;
  vatValue: number | null;
}

export class CollectionDto {
  id: string;
  name: string;
  isActive: boolean;
  address: string;
  locations: Location;
  boxes: Boxes[];
  price: Price[];
  individualFiscalData: IndividualFiscalData;
}
