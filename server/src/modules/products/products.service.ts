import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { generateSlug } from '../../common/utils/slug.utils.js';
import { UploadService } from '../upload/upload.service.js';

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadService: UploadService,
  ) { }


  // create products and also store image in the cloudinary and return the images url.
  async create(dto: CreateProductDto, files?: Express.Multer.File[]) {
    const name = dto.name || dto.title;
    if (!name) {
      throw new BadRequestException('Product name or title is required');
    }
    const slug = dto.slug || generateSlug(name);

    const existing = await this.prisma.product.findUnique({
      where: { slug },
    });

    if (existing) {
      throw new ConflictException('Product slug already exists');
    }

    // Determine category ID safely
    let categoryId = dto.categoryId;
    if (!categoryId && dto.collectionIds && dto.collectionIds.length > 0) {
      categoryId = dto.collectionIds[0];
    }
    if (!categoryId) {
      const firstCat = await this.prisma.category.findFirst();
      if (firstCat) {
        categoryId = firstCat.id;
      } else {
        const defaultCat = await this.prisma.category.create({
          data: {
            name: 'Uncategorized',
            slug: generateSlug('Uncategorized'),
          },
        });
        categoryId = defaultCat.id;
      }
    }

    // Process variants
    const finalVariants =
      dto.variants && dto.variants.length > 0
        ? dto.variants.map((v) => ({
          sku:
            v.sku ||
            `SKU-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
          price: v.price !== undefined ? v.price : 0,
          stock: v.stock !== undefined ? v.stock : 0,
        }))
        : [
          {
            sku:
              dto.sku ||
              `SKU-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
            price: dto.price !== undefined ? dto.price : 0,
            stock: dto.quantity !== undefined ? dto.quantity : 0,
          },
        ];

    if (files && files.length > 0) {
      const uploadedUrls = await this.uploadService.uploadImages(files);
      if (!dto.images) dto.images = [];
      dto.images.push(...uploadedUrls.map((res) => res.url));
    }

    // Process images safely with type guard
    const finalImages: string[] = (dto.images || [])
      .map((img: any) => {
        if (typeof img === 'string') {
          return img;
        } else if (img && typeof img === 'object' && img.url) {
          return String(img.url);
        }
        return null;
      })
      .filter((img): img is string => img !== null);

    const product = (await this.prisma.product.create({
      data: {
        name,
        slug,
        description: dto.description || '',
        status: dto.status || 'ACTIVE',
        categoryId,
        variants: {
          create: finalVariants,
        },
        images: finalImages,
      },
      include: {
        category: true,
        variants: true,
      },
    })) as any;

    const defaultVariant = product.variants[0];
    const totalStock = product.variants.reduce(
      (sum: number, v: any) => sum + v.stock,
      0,
    );
    const imageUrls = product.images || [];

    return {
      id: product.id,
      title: product.name,
      status: product.status,
      quantity: totalStock,
      price: defaultVariant ? defaultVariant.price.toString() : '0.00',
      vendorName: 'NestMart',
      images: imageUrls,
      slug: product.slug,
      categoryId: product.categoryId,
      category: product.category,
      variants: product.variants,
    };
  }

  async findAll() {
    const products = await this.prisma.product.findMany({
      include: {
        category: true,
        variants: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return (products as any[]).map((p) => {
      const defaultVariant = p.variants[0];
      const totalStock = p.variants.reduce(
        (sum: number, v: any) => sum + v.stock,
        0,
      );
      const imageUrls = p.images || [];

      return {
        id: p.id,
        title: p.name,
        status: p.status,
        quantity: totalStock,
        price: defaultVariant ? defaultVariant.price.toString() : '0.00',
        vendorName: 'NestMart',
        images: imageUrls,
        slug: p.slug,
        categoryId: p.categoryId,
        category: p.category,
        variants: p.variants,
      };
    });
  }

  // todo: find products based on the id

  async findOne(idOrSlug: string) {
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        idOrSlug,
      );
    const product = (await this.prisma.product.findFirst({
      where: isUuid
        ? { OR: [{ id: idOrSlug }, { slug: idOrSlug }] }
        : { slug: idOrSlug },
      include: {
        category: true,
        variants: true,
        reviews: {
          include: { user: { include: { profile: true } } },
        },
      },
    })) as any;

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Increment views count asynchronously
    this.prisma.productAnalytics
      .upsert({
        where: { productId: product.id },
        create: { productId: product.id, views: 1 },
        update: { views: { increment: 1 } },
      })
      .catch(() => { });

    const defaultVariant = product.variants[0];
    const totalStock = product.variants.reduce(
      (sum: number, v: any) => sum + v.stock,
      0,
    );
    const imageUrls = product.images || [];

    return {
      id: product.id,
      title: product.name,
      status: product.status,
      quantity: totalStock,
      price: defaultVariant ? defaultVariant.price.toString() : '0.00',
      vendorName: 'NestMart',
      images: imageUrls,
      slug: product.slug,
      categoryId: product.categoryId,
      category: product.category,
      variants: product.variants,
      description: product.description,
      reviews: product.reviews,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

  async update(id: string, dto: UpdateProductDto, files?: Express.Multer.File[]) {
    await this.findOne(id);

    const name = dto.name || dto.title;
    const slug = dto.slug || (name ? generateSlug(name) : undefined);

    if (slug) {
      const existing = await this.prisma.product.findUnique({
        where: { slug },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException('Slug already exists');
      }
    }

    let categoryId = dto.categoryId;
    if (!categoryId && dto.collectionIds && dto.collectionIds.length > 0) {
      categoryId = dto.collectionIds[0];
    }

    await this.prisma.product.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        ...(categoryId && { categoryId }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.status !== undefined && { status: dto.status }),
      },
    });

    // Handle variants update
    if (dto.variants && dto.variants.length > 0) {
      await this.prisma.productVariant.deleteMany({ where: { productId: id } });
      await this.prisma.productVariant.createMany({
        data: dto.variants.map((v) => ({
          productId: id,
          sku:
            v.sku ||
            `SKU-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
          price: v.price !== undefined ? v.price : 0,
          stock: v.stock !== undefined ? v.stock : 0,
        })),
      });
    } else if (
      dto.price !== undefined ||
      dto.quantity !== undefined ||
      dto.sku !== undefined
    ) {
      const firstVariant = await this.prisma.productVariant.findFirst({
        where: { productId: id },
      });
      if (firstVariant) {
        await this.prisma.productVariant.update({
          where: { id: firstVariant.id },
          data: {
            ...(dto.price !== undefined && { price: dto.price }),
            ...(dto.quantity !== undefined && { stock: dto.quantity }),
            ...(dto.sku !== undefined && { sku: dto.sku }),
          },
        });
      } else {
        await this.prisma.productVariant.create({
          data: {
            productId: id,
            sku:
              dto.sku ||
              `SKU-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
            price: dto.price !== undefined ? dto.price : 0,
            stock: dto.quantity !== undefined ? dto.quantity : 0,
          },
        });
      }
    }

    if (files && files.length > 0) {
      const uploadedUrls = await this.uploadService.uploadImages(files);
      if (!dto.images) dto.images = [];
      dto.images.push(...uploadedUrls.map((res) => res.url));
    }

    // Handle images update safely
    if (dto.images) {
      const finalImages: string[] = dto.images
        .map((img: any) => {
          if (typeof img === 'string') {
            return img;
          } else if (img && typeof img === 'object' && img.url) {
            return String(img.url);
          }
          return null;
        })
        .filter((img): img is string => img !== null);

      await this.prisma.product.update({
        where: { id },
        data: { images: finalImages },
      });
    }

    return this.findOne(id);
  }

  async remove(id: string) {
    const product = await this.findOne(id);

    // Delete variants first to avoid constraint issues if cascade is not configured
    await this.prisma.productVariant.deleteMany({
      where: { productId: product.id },
    });

    return this.prisma.product.delete({
      where: { id: product.id },
    });
  }
}

