import { ProductStatus } from '../../../../generated/prisma/index.js';
export declare class CreateProductDto {
    title: string;
    description?: string;
    price: number;
    compareAtPrice?: number;
    costPerItem?: number;
    sku?: string;
    barcode?: string;
    quantity?: number;
    collectionName?: string;
    vendorName?: string;
    category?: string;
    themeTemplate?: string;
    tags?: string[];
    images?: string[];
    collectionIds?: string[];
    variants?: any;
    status?: ProductStatus;
}
