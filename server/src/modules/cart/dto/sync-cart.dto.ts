import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class SyncCartItemDto {
  @IsString()
  @IsNotEmpty()
  variantId!: string;

  @IsNumber()
  @Min(1)
  quantity!: number;
}

export class SyncCartDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SyncCartItemDto)
  items!: SyncCartItemDto[];
}
