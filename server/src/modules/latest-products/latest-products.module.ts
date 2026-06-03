import { Module } from '@nestjs/common';
import { LatestProductsService } from './latest-products.service.js';
import { LatestProductsController } from './latest-products.controller.js';
import { DatabaseModule } from '../../database/database.module.js';

@Module({
  imports: [DatabaseModule],
  controllers: [LatestProductsController],
  providers: [LatestProductsService],
})
export class LatestProductsModule {}
