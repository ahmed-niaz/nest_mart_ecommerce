import { ProductStatus } from '../../../../generated/prisma/index.js';
export declare class CreateProductVariantDto {
    sku?: string;
    price?: number;
    stock?: number;
}
export declare class CreateProductImageDto {
    url: string;
}
export declare class CreateProductDto {
    name?: string;
    title?: string;
    slug?: string;
    description?: string;
    status?: ProductStatus;
    categoryId?: string;
    collectionIds?: string[];
    price?: number;
    quantity?: number;
    sku?: string;
    barcode?: string;
    vendorName?: string;
    category?: string;
    themeTemplate?: string;
    tags?: string[];
    variants?: CreateProductVariantDto[];
    images?: any[];
}
