import { IsNotEmpty, IsString } from 'class-validator';

export class AddToWishlistDto {
  @IsString()
  @IsNotEmpty()
  variantId!: string;
}
