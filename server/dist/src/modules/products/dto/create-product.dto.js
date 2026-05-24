var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsString, IsOptional, IsArray, IsEnum, ValidateNested, IsNumber, Min, } from 'class-validator';
import { Type, Transform, plainToInstance } from 'class-transformer';
import { ProductStatus } from '../../../../generated/prisma/index.js';
export class CreateProductVariantDto {
    sku;
    price;
    stock;
}
__decorate([
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], CreateProductVariantDto.prototype, "sku", void 0);
__decorate([
    IsNumber(),
    Min(0),
    IsOptional(),
    __metadata("design:type", Number)
], CreateProductVariantDto.prototype, "price", void 0);
__decorate([
    IsNumber(),
    Min(0),
    IsOptional(),
    __metadata("design:type", Number)
], CreateProductVariantDto.prototype, "stock", void 0);
export class CreateProductImageDto {
    url;
}
__decorate([
    IsString(),
    __metadata("design:type", String)
], CreateProductImageDto.prototype, "url", void 0);
export class CreateProductDto {
    name;
    title;
    slug;
    description;
    status;
    categoryId;
    collectionIds;
    price;
    quantity;
    sku;
    barcode;
    variants;
    images;
}
__decorate([
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], CreateProductDto.prototype, "name", void 0);
__decorate([
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], CreateProductDto.prototype, "title", void 0);
__decorate([
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], CreateProductDto.prototype, "slug", void 0);
__decorate([
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], CreateProductDto.prototype, "description", void 0);
__decorate([
    IsEnum(ProductStatus),
    IsOptional(),
    __metadata("design:type", String)
], CreateProductDto.prototype, "status", void 0);
__decorate([
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], CreateProductDto.prototype, "categoryId", void 0);
__decorate([
    IsArray(),
    IsString({ each: true }),
    IsOptional(),
    Transform(({ value }) => {
        try {
            return typeof value === 'string' ? JSON.parse(value) : value;
        }
        catch {
            return value;
        }
    }),
    __metadata("design:type", Array)
], CreateProductDto.prototype, "collectionIds", void 0);
__decorate([
    IsNumber(),
    Min(0),
    IsOptional(),
    __metadata("design:type", Number)
], CreateProductDto.prototype, "price", void 0);
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
], CreateProductDto.prototype, "sku", void 0);
__decorate([
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], CreateProductDto.prototype, "barcode", void 0);
__decorate([
    IsArray(),
    ValidateNested({ each: true }),
    Type(() => CreateProductVariantDto),
    IsOptional(),
    Transform(({ value }) => {
        try {
            const parsed = typeof value === 'string' ? JSON.parse(value) : value;
            if (Array.isArray(parsed)) {
                return parsed.map((item) => plainToInstance(CreateProductVariantDto, item));
            }
            return parsed;
        }
        catch {
            return value;
        }
    }),
    __metadata("design:type", Array)
], CreateProductDto.prototype, "variants", void 0);
__decorate([
    IsArray(),
    IsOptional(),
    Transform(({ value }) => {
        try {
            return typeof value === 'string' ? JSON.parse(value) : value;
        }
        catch {
            return value;
        }
    }),
    __metadata("design:type", Array)
], CreateProductDto.prototype, "images", void 0);
//# sourceMappingURL=create-product.dto.js.map