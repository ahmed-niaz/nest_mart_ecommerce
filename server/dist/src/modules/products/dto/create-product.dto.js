var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsString, IsOptional, IsNumber, IsArray, IsEnum, Min, } from 'class-validator';
import { ProductStatus } from '../../../../generated/prisma/index.js';
export class CreateProductDto {
    title;
    description;
    price;
    compareAtPrice;
    costPerItem;
    sku;
    barcode;
    quantity;
    collectionName;
    vendorName;
    category;
    themeTemplate;
    tags;
    images;
    collectionIds;
    variants;
    status;
}
__decorate([
    IsString(),
    __metadata("design:type", String)
], CreateProductDto.prototype, "title", void 0);
__decorate([
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], CreateProductDto.prototype, "description", void 0);
__decorate([
    IsNumber(),
    Min(0),
    __metadata("design:type", Number)
], CreateProductDto.prototype, "price", void 0);
__decorate([
    IsNumber(),
    Min(0),
    IsOptional(),
    __metadata("design:type", Number)
], CreateProductDto.prototype, "compareAtPrice", void 0);
__decorate([
    IsNumber(),
    Min(0),
    IsOptional(),
    __metadata("design:type", Number)
], CreateProductDto.prototype, "costPerItem", void 0);
__decorate([
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], CreateProductDto.prototype, "sku", void 0);
__decorate([
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], CreateProductDto.prototype, "barcode", void 0);
__decorate([
    IsNumber(),
    Min(0),
    IsOptional(),
    __metadata("design:type", Number)
], CreateProductDto.prototype, "quantity", void 0);
__decorate([
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], CreateProductDto.prototype, "collectionName", void 0);
__decorate([
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], CreateProductDto.prototype, "vendorName", void 0);
__decorate([
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], CreateProductDto.prototype, "category", void 0);
__decorate([
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], CreateProductDto.prototype, "themeTemplate", void 0);
__decorate([
    IsArray(),
    IsString({ each: true }),
    IsOptional(),
    __metadata("design:type", Array)
], CreateProductDto.prototype, "tags", void 0);
__decorate([
    IsArray(),
    IsString({ each: true }),
    IsOptional(),
    __metadata("design:type", Array)
], CreateProductDto.prototype, "images", void 0);
__decorate([
    IsArray(),
    IsString({ each: true }),
    IsOptional(),
    __metadata("design:type", Array)
], CreateProductDto.prototype, "collectionIds", void 0);
__decorate([
    IsOptional(),
    __metadata("design:type", Object)
], CreateProductDto.prototype, "variants", void 0);
__decorate([
    IsEnum(ProductStatus),
    IsOptional(),
    __metadata("design:type", String)
], CreateProductDto.prototype, "status", void 0);
//# sourceMappingURL=create-product.dto.js.map