import { CostType } from '@/common/enums';

export class Price {
  id: string;
  name: string;
  description: string;
  cost: number;
  costType: CostType;
}
