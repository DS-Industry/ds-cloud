import { Injectable } from '@nestjs/common';
import { IntegrationRepository } from '@/app/integrations/integration.repository';
import { CollectionService } from '@/app/collection/collection.service';
import { PriceService } from '@/app/price/price.service';

@Injectable()
export class IntegrationService {
  constructor(
    private readonly integrationRepository: IntegrationRepository,
    private readonly collectionService: CollectionService,
    private readonly priceService: PriceService,
  ) {}
}
