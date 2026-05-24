import { IsEnum, IsOptional } from 'class-validator';
import {
  OrderStatus,
  FulfillmentStatus,
  PaymentStatus,
} from '../../../../generated/prisma/index.js';

export class UpdateOrderDto {
  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;

  @IsEnum(FulfillmentStatus)
  @IsOptional()
  fulfillmentStatus?: FulfillmentStatus;

  @IsEnum(PaymentStatus)
  @IsOptional()
  paymentStatus?: PaymentStatus;
}
