import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { WishlistService } from './wishlist.service.js';
import { AddToWishlistDto } from './dto/add-to-wishlist.dto.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@Controller('wishlist')
@UseGuards(JwtAuthGuard)
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  getWishlist(@CurrentUser('id') userId: string) {
    return this.wishlistService.getWishlist(userId);
  }

  @Post('items')
  addItem(@CurrentUser('id') userId: string, @Body() dto: AddToWishlistDto) {
    return this.wishlistService.addItem(userId, dto);
  }

  @Delete('items/:id')
  removeItem(@CurrentUser('id') userId: string, @Param('id') itemId: string) {
    return this.wishlistService.removeItem(userId, itemId);
  }
}
