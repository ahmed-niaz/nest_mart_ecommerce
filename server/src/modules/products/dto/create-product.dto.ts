import {
  IsString,
  IsOptional,
  IsArray,
  IsEnum,
  ValidateNested,
  IsNumber,
  Min,
} from 'class-validator';
import { Type, Transform, plainToInstance } from 'class-transformer';
import { ProductStatus } from '../../../../generated/prisma/index.js';

export class CreateProductVariantDto {
  @IsString()
  @IsOptional()
  sku?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  stock?: number;
}

export class CreateProductImageDto {
  @IsString()
  url!: string;
}

export class CreateProductDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus;

  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @Transform(({ value }) => {
    try {
      return typeof value === 'string' ? JSON.parse(value) : value;
    } catch {
      return value;
    }
  })
  collectionIds?: string[];

  // Flat fields for single variant creation
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  quantity?: number;

  @IsString()
  @IsOptional()
  sku?: string;

  @IsString()
  @IsOptional()
  barcode?: string;

  @IsString()
  @IsOptional()
  vendorName?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  themeTemplate?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @Transform(({ value }) => {
    try {
      return typeof value === 'string' ? JSON.parse(value) : value;
    } catch {
      return value;
    }
  })
  tags?: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductVariantDto)
  @IsOptional()
  @Transform(({ value }) => {
    try {
      const parsed = typeof value === 'string' ? JSON.parse(value) : value;
      if (Array.isArray(parsed)) {
        return parsed.map((item) =>
          plainToInstance(CreateProductVariantDto, item),
        );
      }
      return parsed;
    } catch {
      return value;
    }
  })
  variants?: CreateProductVariantDto[];

  @IsArray()
  @IsOptional()
  @Transform(({ value }) => {
    try {
      return typeof value === 'string' ? JSON.parse(value) : value;
    } catch {
      return value;
    }
  })
  images?: any[];
}
