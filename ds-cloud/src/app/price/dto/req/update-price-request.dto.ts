import { CreateExistingService } from '@/app/services/dto/req/create-existing-service.dto';

export class UpdatePriceRequestDto {
  collectionId?: string;
  serviceObjectId?: string;
  serviceInfo?: string[];
  serviceDuration?: number;
}
