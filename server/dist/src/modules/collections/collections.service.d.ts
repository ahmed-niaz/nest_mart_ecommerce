import { PrismaService } from '../../database/prisma.service.js';
export declare class CollectionsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: string;
        title: string;
        description: string | null;
        image: string | null;
        themeTemplate: string | null;
        productCount: number;
        status: string;
    }[]>;
    create(title: string, description?: string, image?: string, themeTemplate?: string, productIds?: string[]): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        themeTemplate: string | null;
        image: string | null;
    }>;
    findOne(id: string): Promise<{
        products: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            description: string | null;
            price: import("@prisma/client-runtime-utils").Decimal;
            compareAtPrice: import("@prisma/client-runtime-utils").Decimal | null;
            costPerItem: import("@prisma/client-runtime-utils").Decimal | null;
            sku: string | null;
            barcode: string | null;
            quantity: number;
            collectionName: string | null;
            vendorName: string | null;
            category: string | null;
            themeTemplate: string | null;
            tags: string[];
            images: string[];
            variants: import("generated/prisma/runtime/client.js").JsonValue | null;
            status: import("generated/prisma/index.js").$Enums.ProductStatus;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        themeTemplate: string | null;
        image: string | null;
    }>;
}
