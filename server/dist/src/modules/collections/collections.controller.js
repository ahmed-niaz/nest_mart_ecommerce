var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Controller, Get, Post, Body, UseGuards, BadRequestException } from '@nestjs/common';
import { CollectionsService } from './collections.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Role } from '../../../generated/prisma/index.js';
import { Public } from '../../common/decorators/public.decorator.js';
let CollectionsController = class CollectionsController {
    collectionsService;
    constructor(collectionsService) {
        this.collectionsService = collectionsService;
    }
    findAll() {
        return this.collectionsService.findAll();
    }
    create(body) {
        if (!body.title) {
            throw new BadRequestException('Collection title is required');
        }
        return this.collectionsService.create(body.title, body.description, body.image, body.themeTemplate, body.productIds);
    }
};
__decorate([
    Get(),
    Public(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CollectionsController.prototype, "findAll", null);
__decorate([
    Post(),
    UseGuards(JwtAuthGuard, RolesGuard),
    Roles(Role.ADMIN, Role.SUPER_ADMIN),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CollectionsController.prototype, "create", null);
CollectionsController = __decorate([
    Controller('collections'),
    __metadata("design:paramtypes", [CollectionsService])
], CollectionsController);
export { CollectionsController };
//# sourceMappingURL=collections.controller.js.map