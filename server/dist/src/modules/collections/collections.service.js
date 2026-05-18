var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
let CollectionsService = class CollectionsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
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
    async create(title, description, image, themeTemplate, productIds) {
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
    async findOne(id) {
        const col = await this.prisma.collection.findUnique({
            where: { id },
            include: {
                products: true,
            }
        });
        if (!col)
            throw new NotFoundException('Collection not found');
        return col;
    }
};
CollectionsService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], CollectionsService);
export { CollectionsService };
//# sourceMappingURL=collections.service.js.map