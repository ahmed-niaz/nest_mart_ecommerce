import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import { AddToCartDto } from './dto/add-to-cart.dto.js';
import { UpdateCartItemDto } from './dto/update-cart-item.dto.js';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async getCart(userId: string) {
    let cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: { variant: { include: { product: true } } },
        },
      },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
        include: {
          items: { include: { variant: { include: { product: true } } } },
        },
      });
    }

    return cart;
  }

  async addItem(userId: string, dto: AddToCartDto) {
    const cart = await this.getCart(userId);

    const variant = await this.prisma.productVariant.findUnique({
      where: { id: dto.variantId },
    });

    if (!variant) {
      throw new NotFoundException('Variant not found');
    }

    const existingItem = cart.items.find(
      (item) => item.variantId === dto.variantId,
    );

    if (existingItem) {
      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + dto.quantity },
      });
    } else {
      await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          variantId: dto.variantId,
          quantity: dto.quantity,
          priceSnap: variant.price,
        },
      });
    }

    return this.getCart(userId);
  }

  async updateItemQuantity(
    userId: string,
    itemId: string,
    dto: UpdateCartItemDto,
  ) {
    const cart = await this.getCart(userId);
    const item = cart.items.find((i) => i.id === itemId);

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    await this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: dto.quantity },
    });

    return this.getCart(userId);
  }

  async removeItem(userId: string, itemId: string) {
    const cart = await this.getCart(userId);
    const item = cart.items.find((i) => i.id === itemId);

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    await this.prisma.cartItem.delete({
      where: { id: itemId },
    });

    return this.getCart(userId);
  }
}
