import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';

@Injectable()
export class CollectionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const collections = await this.prisma.collection.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return collections.map(col => ({
      id: col.id,
      title: col.title,
      description: col.description,
      image: col.image,
      themeTemplate: col.themeTemplate,
      productCount: col._count.products,
      status: 'ACTIVE',
    }));
  }

  async create(title: string, description?: string, image?: string, themeTemplate?: string, productIds?: string[]) {
    return this.prisma.collection.create({
      data: {
        title,
        description,
        image,
        themeTemplate,
        ...(productIds && productIds.length > 0 && {
          products: {
            connect: productIds.map(id => ({ id }))
          }
        })
      }
    });
  }

  async findOne(id: string) {
    const col = await this.prisma.collection.findUnique({
      where: { id },
      include: {
        products: true,
      }
    });
    if (!col) throw new NotFoundException('Collection not found');
    return col;
  }
}
