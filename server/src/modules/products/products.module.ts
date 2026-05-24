import { Module } from '@nestjs/common';
import { ProductsService } from './products.service.js';
import { ProductsController } from './products.controller.js';
import { DatabaseModule } from '../../database/database.module.js';
import { UploadModule } from '../upload/upload.module.js';

@Module({
  imports: [DatabaseModule, UploadModule],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
