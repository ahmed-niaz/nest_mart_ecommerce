import { PrismaService } from '../../database/prisma.service.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { UploadService } from '../upload/upload.service.js';
export declare class ProductsService {
    private readonly prisma;
    private readonly uploadService;
    constructor(prisma: PrismaService, uploadService: UploadService);
    create(dto: CreateProductDto, files?: Express.Multer.File[]): Promise<{
        id: any;
        title: any;
        status: any;
        quantity: any;
        price: any;
        vendorName: string;
        images: any;
        slug: any;
        categoryId: any;
        category: any;
        variants: any;
    }>;
    findAll(category?: string, search?: string, sort?: string, page?: string, limit?: string, pagination?: boolean): Promise<{
        id: any;
        title: any;
        status: any;
        quantity: any;
        price: any;
        vendorName: string;
        images: any;
        slug: any;
        categoryId: any;
        category: any;
        variants: any;
        createdAt: any;
    }[] | {
        products: {
            id: any;
            title: any;
            status: any;
            quantity: any;
            price: any;
            vendorName: string;
            images: any;
            slug: any;
            categoryId: any;
            category: any;
            variants: any;
            createdAt: any;
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(idOrSlug: string): Promise<{
        id: any;
        title: any;
        status: any;
        quantity: any;
        price: any;
        vendorName: string;
        images: any;
        slug: any;
        categoryId: any;
        category: any;
        variants: any;
        description: any;
        reviews: any;
        createdAt: any;
        updatedAt: any;
    }>;
    update(id: string, dto: UpdateProductDto, files?: Express.Multer.File[]): Promise<{
        id: any;
        title: any;
        status: any;
        quantity: any;
        price: any;
        vendorName: string;
        images: any;
        slug: any;
        categoryId: any;
        category: any;
        variants: any;
        description: any;
        reviews: any;
        createdAt: any;
        updatedAt: any;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        slug: string;
        description: string | null;
        status: import("generated/prisma/index.js").$Enums.ProductStatus;
        categoryId: string;
    }>;
}
