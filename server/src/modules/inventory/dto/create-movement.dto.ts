import {
  IsString,
  IsUUID,
  IsEnum,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { MovementType } from '../../../../generated/prisma/index.js';

export class CreateMovementDto {
  @IsUUID()
  variantId: string;

  @IsEnum(MovementType)
  type: MovementType;

  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
