import {
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsDateString,
  Min,
} from 'class-validator';
import { DiscountType } from '../../../../generated/prisma/index.js';

export class UpdateCouponDto {
  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsEnum(DiscountType)
  discountType?: DiscountType;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discountValue?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minPurchaseAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxDiscount?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  usageLimit?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
