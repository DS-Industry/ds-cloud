import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCollectionDto } from './dto/req/create-collection.dto';
import { getCSVFile } from '../../utils/file.utils';
import * as fs from 'fs';
import * as iconv from 'iconv-lite';
import { CollectionFileModel } from '../../utils/collection-file-model.utils';
import { CsvParser } from 'nest-csv-parser';
import { UserService } from '../../user/user.service';
import { CollectionRepository } from './collection.repository';
import { GetAllCollectionsResponse } from './dto/res/get-all-collections-response.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Integration,
  IntegrationDocument,
} from '../integrations/schema/integration.schema';
import { UpdateCollectionDto } from './dto/req/update-collection.dto';
import { Service, ServiceDocument } from '../services/schema/service.schema';
import { CreatePriceRequest } from '@/app/price/dto/req/create-price-request.dto';
import { BulkWriteResult } from '@/common/dto/bulk-write-result.dto';
import { PriceService } from '@/app/price/price.service';

//TODO
//1. Add function to insert price list

@Injectable()
export class CollectionService {
  constructor(
    @InjectModel(Integration.name)
    private integrationModel: Model<IntegrationDocument>,
    @InjectModel(Service.name)
    private serviceModel: Model<ServiceDocument>,
    private readonly collectionRepository: CollectionRepository,
    private readonly priceService: PriceService,
    private readonly userService: UserService,
    private readonly csvParser: CsvParser,
  ) {}

  /**
   * Creating new collection (Device group)
   * Collection is owned by a user that is placing request
   * @param createCollectionDto
   * @param userId
   */
  async create(createCollectionDto: CreateCollectionDto, userId: string) {
    const createPriceReq: CreatePriceRequest = new CreatePriceRequest();
    let prices: BulkWriteResult;
    const { priceList, ...collectionData } = createCollectionDto;

    if (createCollectionDto.priceList.length > 0) {
      createPriceReq.collectionId = +createCollectionDto.identifier;
      createPriceReq.serviceList = createCollectionDto.priceList;
      prices = await this.priceService.create(createPriceReq);

      collectionData['prices'] = prices.insertedIds.map((p) => p._id);
    }
    collectionData['owner'] = userId;
    collectionData['isActive'] = true;

    return await this.collectionRepository.create(collectionData);
  }

  /**
   * Returning all collections in db
   */
  async findAllByIntegration(code: number) {
    const integrations = await this.integrationModel.findOne({ id: code });
    const { _id } = integrations;
    const collections =
      await this.collectionRepository.findCollectionListByIntegration(_id);

    const res: GetAllCollectionsResponse[] = collections.map((c, i) => {
      const boxes: any[] = c.devices.map((d, i) => {
        return {
          id: d.identifier,
          number: d.bayNumber,
          status: d.status,
        };
      });

      const prices: any[] = c.prices.map((p, i) => {
        return {
          id: p.service.id,
          name: p.service.name,
          description: p.service.description,
          cost: p.cost,
          costType: p.costType,
        };
      });

      return {
        id: c.identifier,
        name: c.name,
        address: c.address,
        isActive: c.isActive,
        type: c.type,
        stepCost: c.stepCost,
        limitMinCost: c.limitMinCost,
        limitMaxCost: c.limitMaxCost,
        location: {
          lat: c.lat,
          lon: c.lon,
        },
        boxes: boxes,
        price: prices,
      };
    });
    return res;
  }

  /**
   * Get Collection Bay by bay number
   * @param id
   * @param bayNumber
   */
  async getCollectionDeviceByBayNumber(id: string, bayNumber: number) {
    return await this.collectionRepository.getCollectionDeviceByBayNumber(
      id,
      bayNumber,
    );
  }

  async findOneByIdentifier(identifier: string) {
    return await this.collectionRepository.findOneByFilter({
      identifier: identifier,
    });
  }

  /**
   * Update collection
   * @param id
   * @param updateCollection
   */
  async findOneAndUpdate(id: string, updateCollection: UpdateCollectionDto) {
    let updateQuery;
    let integrations: any[];
    let prices: BulkWriteResult;

    if (updateCollection.integrations) {
      integrations = await this.integrationModel.find({
        id: { $in: updateCollection.integrations },
      });
      updateQuery = {
        ...updateCollection,
        integrations,
      };
    } else if (updateCollection.priceList.length > 0) {
      const createPriceReq: CreatePriceRequest = new CreatePriceRequest();
      createPriceReq.collectionId = +id;
      createPriceReq.serviceList = updateCollection.priceList;
      prices = await this.priceService.create(createPriceReq);

      updateQuery = {
        ...updateCollection,
        prices: prices.insertedIds.map((p) => p._id),
      };
    } else {
      updateQuery = { ...updateCollection };
    }

    return await this.collectionRepository.findOneAndUpdate(
      { identifier: id },
      updateQuery,
    );
  }

  /**
   * Bulk update collections from csv
   * @param fileName
   */
  async batchUpdate(fileName: string) {
    const path = getCSVFile(fileName);
    const bulkOps = [];

    const stream = fs.createReadStream(path).pipe(iconv.decodeStream('utf-8'));
    const data = await this.csvParser.parse(
      stream,
      CollectionFileModel,
      null,
      null,
      { separator: ',' },
    );

    for (const item of data.list) {
      let integrationsIds;
      let integrations;
      if (item.integration.length > 0) {
        integrationsIds = item.integration.split(':').map(Number);
        integrations = await this.integrationModel
          .find({
            id: { $in: integrationsIds },
          })
          .lean()
          .select({ _id: 1, name: 1 });
      }

      const query = {
        city: item.city,
        name: item.name,
        address: item.address,
        lat: item.lat,
        lon: item.lon,
        type: item.type,
        limitMaxCost: item.limitMaxCost,
        limitMinCost: item.limitMinCost,
        stepCost: item.stepCost,
      };

      if (integrations) {
        query['$addToSet'] = { integrations: integrations };
      }

      bulkOps.push({
        updateOne: {
          filter: { identifier: item.identifier },
          update: query,
          upsert: true,
        },
      });
    }

    fs.unlinkSync(path);
    return await this.collectionRepository.batchUpdate(bulkOps);
  }

  /**
   * Uploading existing collections from csv file
   * The file has to be in the special format
   * After reading inserting the data in the db
   * @param fileName
   */
  async groupUpload(fileName: string, userId: string) {
    //Getting correct path through utils methods getCsvFile
    const path = getCSVFile(fileName);

    //Creating stream
    //Adding decoding to stream to support Russian language
    const stream = fs.createReadStream(path).pipe(iconv.decodeStream('utf-8'));
    const data = await this.csvParser.parse(
      stream,
      CollectionFileModel,
      null,
      null,
      { separator: ',' },
    );

    let createCount = 0;

    for (const item of data.list) {
      await this.collectionRepository.create({
        ...item,
        owner: userId,
        isActive: true,
      });
      createCount++;
    }
    fs.unlinkSync(path);
    return { code: HttpStatus.OK, createdItems: createCount };
  }

  /**
   * Get collection by Id
   * @param id
   */
  async findOne(id: any) {
    const collection = await this.collectionRepository.findOneById(id);

    if (!collection)
      throw new NotFoundException(`Collection with id ${id} not found`);

    return collection;
  }

  /**
   * Get all collection by user that making the request
   * @param ownerId
   */
  async getCollectionsByOwner(ownerId: string) {
    const collections = await this.collectionRepository.findAll({
      owner: ownerId,
    });

    if (!collections)
      throw new NotFoundException(
        `Collections for owner id: ${ownerId} not found`,
      );

    return collections;
  }

  /**
   * Remove collection by id
   * @param id
   */
  async remove(id: string) {
    const removed = await this.collectionRepository.removeMany({ _id: id });
    if (!removed)
      throw new BadRequestException(
        `Unable to remove collection with id: ${id}`,
      );

    return { code: HttpStatus.OK, message: 'Success' };
  }
}
