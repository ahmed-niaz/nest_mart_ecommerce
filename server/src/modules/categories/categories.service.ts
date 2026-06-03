import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';
import { generateSlug } from '../../common/utils/slug.utils.js';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCategoryDto) {
    const name = dto.name || dto.title;
    if (!name) {
      throw new BadRequestException('Category name or title is required');
    }
    const slug = dto.slug || generateSlug(name);

    const existing = await this.prisma.category.findUnique({
      where: { slug },
    });
    if (existing) {
      throw new ConflictException('Category slug already exists');
    }

    const category = await this.prisma.category.create({
      data: {
        name,
        slug,
        categoriesImage: dto.categoriesImage,
      },
    });

    if (dto.productIds && dto.productIds.length > 0) {
      await this.prisma.product.updateMany({
        where: { id: { in: dto.productIds } },
        data: { categoryId: category.id },
      });
    }

    return {
      id: category.id,
      name: category.name,
      title: category.name,
      slug: category.slug,
      categoriesImage: category.categoriesImage,
      productCount: dto.productIds ? dto.productIds.length : 0,
      status: 'ACTIVE',
      createdAt: category.createdAt,
    };
  }

  async findAll() {
    const categories = await this.prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return categories.map((c) => ({
      id: c.id,
      name: c.name,
      title: c.name,
      slug: c.slug,
      categoriesImage: c.categoriesImage,
      productCount: c._count.products,
      status: 'ACTIVE',
      createdAt: c.createdAt,
    }));
  }

  async findOne(idOrSlug: string) {
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        idOrSlug,
      );
    const category = await this.prisma.category.findFirst({
      where: isUuid
        ? { OR: [{ id: idOrSlug }, { slug: idOrSlug }] }
        : { slug: idOrSlug },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
    if (!category) throw new NotFoundException('Category not found');
    return {
      id: category.id,
      name: category.name,
      title: category.name,
      slug: category.slug,
      categoriesImage: category.categoriesImage,
      productCount: category._count.products,
      status: 'ACTIVE',
      createdAt: category.createdAt,
    };
  }

  async update(id: string, dto: UpdateCategoryDto) {
    await this.findOne(id);
    const name = dto.name || dto.title;
    const slug = dto.slug || (name ? generateSlug(name) : undefined);

    if (slug) {
      const existing = await this.prisma.category.findUnique({
        where: { slug },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException('Slug already exists');
      }
    }

    const category = await this.prisma.category.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        ...(dto.categoriesImage !== undefined && {
          categoriesImage: dto.categoriesImage,
        }),
      },
    });

    if (dto.productIds) {
      if (dto.productIds.length > 0) {
        await this.prisma.product.updateMany({
          where: { id: { in: dto.productIds } },
          data: { categoryId: category.id },
        });
      }
    }

    const count = await this.prisma.product.count({
      where: { categoryId: category.id },
    });

    return {
      id: category.id,
      name: category.name,
      title: category.name,
      slug: category.slug,
      categoriesImage: category.categoriesImage,
      productCount: count,
      status: 'ACTIVE',
      createdAt: category.createdAt,
    };
  }

  async remove(id: string) {
    const category = await this.findOne(id);
    return this.prisma.category.delete({ where: { id: category.id } });
  }
}
