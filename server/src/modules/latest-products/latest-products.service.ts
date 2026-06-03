import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import { ProductStatus } from '../../../generated/prisma/index.js';

@Injectable()
export class LatestProductsService {
  constructor(private prisma: PrismaService) {}

  async getLatestProducts() {
    const products = await this.prisma.product.findMany({
      where: {
        status: ProductStatus.ACTIVE,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 8,
      include: {
        category: {
          select: { name: true, slug: true },
        },
        images: {
          orderBy: { order: 'asc' },
        },
        variants: true,
      },
    });
    return products;
  }
}
