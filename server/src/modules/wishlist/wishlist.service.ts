import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import { AddToWishlistDto } from './dto/add-to-wishlist.dto.js';

@Injectable()
export class WishlistService {
  constructor(private readonly prisma: PrismaService) {}

  async getWishlist(userId: string) {
    let wishlist = await this.prisma.wishlist.findUnique({
      where: { userId },
      include: {
        items: {
          include: { variant: { include: { product: true } } },
        },
      },
    });

    if (!wishlist) {
      wishlist = await this.prisma.wishlist.create({
        data: { userId },
        include: {
          items: { include: { variant: { include: { product: true } } } },
        },
      });
    }

    return wishlist;
  }

  async addItem(userId: string, dto: AddToWishlistDto) {
    const wishlist = await this.getWishlist(userId);

    const variant = await this.prisma.productVariant.findUnique({
      where: { id: dto.variantId },
    });

    if (!variant) {
      throw new NotFoundException('Variant not found');
    }

    const existingItem = wishlist.items.find(
      (item) => item.variantId === dto.variantId,
    );

    if (existingItem) {
      throw new ConflictException('Variant is already in wishlist');
    }

    await this.prisma.wishlistItem.create({
      data: {
        wishlistId: wishlist.id,
        variantId: dto.variantId,
      },
    });

    return this.getWishlist(userId);
  }

  async removeItem(userId: string, itemId: string) {
    const wishlist = await this.getWishlist(userId);
    const item = wishlist.items.find((i) => i.id === itemId);

    if (!item) {
      throw new NotFoundException('Wishlist item not found');
    }

    await this.prisma.wishlistItem.delete({
      where: { id: itemId },
    });

    return this.getWishlist(userId);
  }
}
