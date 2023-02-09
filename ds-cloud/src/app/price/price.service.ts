import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePriceRequest } from '@/app/price/dto/req/create-price-request.dto';
import { PriceRepository } from '@/app/price/price.repository';
import { ServicesService } from '@/app/services/services.service';
import { CostType } from '@/common/enums';
import { BulkWriteResult } from '@/common/dto/bulk-write-result.dto';

//TODO
//1. Test create function
//2. Test createDefaultPriceList

@Injectable()
export class PriceService {
  constructor(
    private readonly priceRepository: PriceRepository,
    private readonly servicesService: ServicesService,
  ) {}

  /**
   * Create single instance of
   * @param createPriceReq
   */
  async create(createPriceReq: CreatePriceRequest) {
    const servicesIds: number[] = createPriceReq.serviceList.map(
      (s) => s.serviceId,
    );
    const services = await this.servicesService.findServicesListById(
      servicesIds,
    );

    if (services.length == 0)
      throw new NotFoundException(
        `Service with this ids ${createPriceReq.serviceList} not found`,
      );

    const bulkIns: any[] = [];

    for (const service of services) {
      const priceData = {
        collectionId: createPriceReq.collectionId,
        cost: createPriceReq.serviceList.filter(
          (s) => s.serviceId === service.id,
        )[0].cost,
        costType: createPriceReq.serviceList.filter(
          (s) => s.serviceId === service.id,
        )[0].costType,
        service: service._id,
        lastUpdateDate: new Date(Date.now()),
      };

      bulkIns.push({
        insertOne: {
          document: priceData,
        },
      });
    }

    return await this.priceRepository.batchInsert(bulkIns);
  }

  /**
   * Create price list of all the services for single collection
   * @param collectionId
   * @param cost
   * @param costType

  async createDefaultPriceList(
    collectionId: number,
    cost: number,
    costType: CostType,
  ) {
    const services: any[] = await this.servicesService.findAll();
    let bulkIns: any[];

    for (const service of services) {
      const createCollectionRequest: CreatePriceRequest = {
        cost: cost,
        costType: costType,
        collectionId: collectionId,
        serviceId: service._id,
        lastUpdateDate: new Date(Date.now()),
      };

      bulkIns.push({
        insertWrite: {
          document: createCollectionRequest,
        },
      });
    }

    const insertResult: BulkWriteResult =
      await this.priceRepository.batchInsert(bulkIns);

    return insertResult.insertedIds;
  }
   */
}
