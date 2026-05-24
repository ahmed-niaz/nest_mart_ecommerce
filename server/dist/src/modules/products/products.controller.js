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
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFiles, } from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { ProductsService } from './products.service.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Role } from '../../../generated/prisma/index.js';
import { Public } from '../../common/decorators/public.decorator.js';
let ProductsController = class ProductsController {
    productsService;
    constructor(productsService) {
        this.productsService = productsService;
    }
    create(createProductDto, files) {
        return this.productsService.create(createProductDto, files);
    }
    findAll() {
        return this.productsService.findAll();
    }
    findOne(id) {
        return this.productsService.findOne(id);
    }
    update(id, updateProductDto, files) {
        return this.productsService.update(id, updateProductDto, files);
    }
    remove(id) {
        return this.productsService.remove(id);
    }
};
__decorate([
    Post(),
    UseGuards(JwtAuthGuard, RolesGuard),
    Roles(Role.ADMIN, Role.SUPER_ADMIN),
    UseInterceptors(AnyFilesInterceptor()),
    __param(0, Body()),
    __param(1, UploadedFiles()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateProductDto, Array]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "create", null);
__decorate([
    Get(),
    Public(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "findAll", null);
__decorate([
    Get(':id'),
    Public(),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "findOne", null);
__decorate([
    Patch(':id'),
    UseGuards(JwtAuthGuard, RolesGuard),
    Roles(Role.ADMIN, Role.SUPER_ADMIN),
    UseInterceptors(AnyFilesInterceptor()),
    __param(0, Param('id')),
    __param(1, Body()),
    __param(2, UploadedFiles()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateProductDto, Array]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "update", null);
__decorate([
    Delete(':id'),
    UseGuards(JwtAuthGuard, RolesGuard),
    Roles(Role.ADMIN, Role.SUPER_ADMIN),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "remove", null);
ProductsController = __decorate([
    Controller('products'),
    __metadata("design:paramtypes", [ProductsService])
], ProductsController);
export { ProductsController };
//# sourceMappingURL=products.controller.js.map