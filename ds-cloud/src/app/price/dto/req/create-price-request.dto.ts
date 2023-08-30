import { CreateExistingService } from '@/app/services/dto/req/create-existing-service.dto';

export class CreatePriceRequest {
  collectionId: number;
  serviceList: CreateExistingService[];
  serviceInfo: string[];
  serviceDuration: number;
  lastUpdateDate: Date;
}
