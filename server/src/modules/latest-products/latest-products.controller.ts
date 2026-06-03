import { Controller, Get } from '@nestjs/common';
import { LatestProductsService } from './latest-products.service.js';
import { Public } from '../../common/decorators/public.decorator.js';

@Controller('latest-products')
export class LatestProductsController {
  constructor(private readonly latestProductsService: LatestProductsService) {}

  @Get()
  @Public()
  getLatestProducts() {
    return this.latestProductsService.getLatestProducts();
  }
}
