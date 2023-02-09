import { Injectable } from '@nestjs/common';
import { ServicesRepository } from '@/app/services/services.repository';

@Injectable()
export class ServicesService {
  constructor(private readonly serviceRepository: ServicesRepository) {}

  /**
   * Find single service by id
   * @param id
   */
  async findServiceById(id: number) {
    return await this.serviceRepository.findOneByFilter({ id: id });
  }

  async findServicesListById(servicesId: number[]) {
    return await this.serviceRepository.findServicesListByIds(servicesId);
  }

  /**
   * Find all services
   */
  async findAll() {
    return await this.serviceRepository.findAll({});
  }
}
