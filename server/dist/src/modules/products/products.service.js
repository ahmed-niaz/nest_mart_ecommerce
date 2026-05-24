var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable, NotFoundException, ConflictException, BadRequestException, } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import { generateSlug } from '../../common/utils/slug.utils.js';
import { UploadService } from '../upload/upload.service.js';
let ProductsService = class ProductsService {
    prisma;
    uploadService;
    constructor(prisma, uploadService) {
        this.prisma = prisma;
        this.uploadService = uploadService;
    }
    async create(dto, files) {
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
        let categoryId = dto.categoryId;
        if (!categoryId && dto.collectionIds && dto.collectionIds.length > 0) {
            categoryId = dto.collectionIds[0];
        }
        if (!categoryId) {
            const firstCat = await this.prisma.category.findFirst();
            if (firstCat) {
                categoryId = firstCat.id;
            }
            else {
                const defaultCat = await this.prisma.category.create({
                    data: {
                        name: 'Uncategorized',
                        slug: generateSlug('Uncategorized'),
                    },
                });
                categoryId = defaultCat.id;
            }
        }
        const finalVariants = dto.variants && dto.variants.length > 0
            ? dto.variants.map((v) => ({
                sku: v.sku ||
                    `SKU-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
                price: v.price !== undefined ? v.price : 0,
                stock: v.stock !== undefined ? v.stock : 0,
            }))
            : [
                {
                    sku: dto.sku ||
                        `SKU-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
                    price: dto.price !== undefined ? dto.price : 0,
                    stock: dto.quantity !== undefined ? dto.quantity : 0,
                },
            ];
        if (files && files.length > 0) {
            const uploadedUrls = await this.uploadService.uploadImages(files);
            if (!dto.images)
                dto.images = [];
            dto.images.push(...uploadedUrls.map((res) => res.url));
        }
        const finalImages = (dto.images || [])
            .map((img) => {
            if (typeof img === 'string') {
                return img;
            }
            else if (img && typeof img === 'object' && img.url) {
                return String(img.url);
            }
            return null;
        })
            .filter((img) => img !== null);
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
        }));
        const defaultVariant = product.variants[0];
        const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
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
        return products.map((p) => {
            const defaultVariant = p.variants[0];
            const totalStock = p.variants.reduce((sum, v) => sum + v.stock, 0);
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
    async findOne(idOrSlug) {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(idOrSlug);
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
        }));
        if (!product) {
            throw new NotFoundException('Product not found');
        }
        this.prisma.productAnalytics
            .upsert({
            where: { productId: product.id },
            create: { productId: product.id, views: 1 },
            update: { views: { increment: 1 } },
        })
            .catch(() => { });
        const defaultVariant = product.variants[0];
        const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
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
    async update(id, dto, files) {
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
        if (dto.variants && dto.variants.length > 0) {
            await this.prisma.productVariant.deleteMany({ where: { productId: id } });
            await this.prisma.productVariant.createMany({
                data: dto.variants.map((v) => ({
                    productId: id,
                    sku: v.sku ||
                        `SKU-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
                    price: v.price !== undefined ? v.price : 0,
                    stock: v.stock !== undefined ? v.stock : 0,
                })),
            });
        }
        else if (dto.price !== undefined ||
            dto.quantity !== undefined ||
            dto.sku !== undefined) {
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
            }
            else {
                await this.prisma.productVariant.create({
                    data: {
                        productId: id,
                        sku: dto.sku ||
                            `SKU-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
                        price: dto.price !== undefined ? dto.price : 0,
                        stock: dto.quantity !== undefined ? dto.quantity : 0,
                    },
                });
            }
        }
        if (files && files.length > 0) {
            const uploadedUrls = await this.uploadService.uploadImages(files);
            if (!dto.images)
                dto.images = [];
            dto.images.push(...uploadedUrls.map((res) => res.url));
        }
        if (dto.images) {
            const finalImages = dto.images
                .map((img) => {
                if (typeof img === 'string') {
                    return img;
                }
                else if (img && typeof img === 'object' && img.url) {
                    return String(img.url);
                }
                return null;
            })
                .filter((img) => img !== null);
            await this.prisma.product.update({
                where: { id },
                data: { images: finalImages },
            });
        }
        return this.findOne(id);
    }
    async remove(id) {
        const product = await this.findOne(id);
        await this.prisma.productVariant.deleteMany({
            where: { productId: product.id },
        });
        return this.prisma.product.delete({
            where: { id: product.id },
        });
    }
};
ProductsService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService,
        UploadService])
], ProductsService);
export { ProductsService };
//# sourceMappingURL=products.service.js.map