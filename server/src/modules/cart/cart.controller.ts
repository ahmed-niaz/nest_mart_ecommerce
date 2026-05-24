import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service.js';
import { AddToCartDto } from './dto/add-to-cart.dto.js';
import { UpdateCartItemDto } from './dto/update-cart-item.dto.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@CurrentUser('id') userId: string) {
    return this.cartService.getCart(userId);
  }

  @Post('items')
  addItem(@CurrentUser('id') userId: string, @Body() dto: AddToCartDto) {
    return this.cartService.addItem(userId, dto);
  }

  @Patch('items/:id')
  updateItem(
    @CurrentUser('id') userId: string,
    @Param('id') itemId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItemQuantity(userId, itemId, dto);
  }

  @Delete('items/:id')
  removeItem(@CurrentUser('id') userId: string, @Param('id') itemId: string) {
    return this.cartService.removeItem(userId, itemId);
  }
}
