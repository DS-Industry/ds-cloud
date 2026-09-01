import { Global, Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { PrismaService } from './prisma.service';
import { ConfigModule } from '@nestjs/config';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [DatabaseService, PrismaService],
  exports: [DatabaseService, PrismaService],
})
export class DatabaseModule {}
