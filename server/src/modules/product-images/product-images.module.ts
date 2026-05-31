import { Module } from '@nestjs/common';
import { ProductImagesService } from './product-images.service.js';
import { ProductImagesController } from './product-images.controller.js';
import { UploadModule } from '../upload/upload.module.js';

@Module({
  imports: [UploadModule],
  controllers: [ProductImagesController],
  providers: [ProductImagesService],
  exports: [ProductImagesService],
})
export class ProductImagesModule {}
