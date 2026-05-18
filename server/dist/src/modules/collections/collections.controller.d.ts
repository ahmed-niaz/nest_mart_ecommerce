import { CollectionsService } from './collections.service.js';
export declare class CollectionsController {
    private readonly collectionsService;
    constructor(collectionsService: CollectionsService);
    findAll(): Promise<{
        id: string;
        title: string;
        description: string | null;
        image: string | null;
        themeTemplate: string | null;
        productCount: number;
        status: string;
    }[]>;
    create(body: {
        title: string;
        description?: string;
        image?: string;
        themeTemplate?: string;
        productIds?: string[];
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        themeTemplate: string | null;
        image: string | null;
    }>;
}
