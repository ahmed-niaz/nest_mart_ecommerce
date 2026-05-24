import { Module } from '@nestjs/common';
import { WishlistService } from './wishlist.service.js';
import { WishlistController } from './wishlist.controller.js';

@Module({
  controllers: [WishlistController],
  providers: [WishlistService],
  exports: [WishlistService],
})
export class WishlistModule {}
