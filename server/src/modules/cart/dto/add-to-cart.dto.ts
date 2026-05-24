import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class AddToCartDto {
  @IsString()
  @IsNotEmpty()
  variantId!: string;

  @IsNumber()
  @Min(1)
  quantity!: number;
}
