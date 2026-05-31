import { IsString, IsOptional, IsArray } from 'class-validator';

export class CreateCategoryDto {
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
  categoriesImage?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  productIds?: string[];
}
