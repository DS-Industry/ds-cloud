import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

type OnviVacuumDevice = {
  id: number;
  name: string;
  isVacuumFree: boolean;
  carWashPos: { posId: number };
};

type CarWashDeviceDelegate = {
  findMany: (args: {
    where?: unknown;
    select?: unknown;
  }) => Promise<OnviVacuumDevice[]>;
};

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly client: PrismaClient;

  constructor(configService: ConfigService) {
    this.client = new PrismaClient({
      datasources: {
        db: {
          url: configService.get<string>('DATABASE_URL'),
        },
      },
    });
  }

  get carWashDevice(): CarWashDeviceDelegate {
    return (this.client as PrismaClient & { carWashDevice: CarWashDeviceDelegate })
      .carWashDevice;
  }

  async onModuleInit() {
    await this.client.$connect();
  }

  async onModuleDestroy() {
    await this.client.$disconnect();
  }
}
