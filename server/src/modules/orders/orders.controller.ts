import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service.js';
import { UpdateOrderDto } from './dto/update-order.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Role } from '../../../generated/prisma/index.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';

import { CheckoutDto } from './dto/checkout.dto.js';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('checkout')
  checkout(@CurrentUser('id') userId: string, @Body() dto: CheckoutDto) {
    return this.ordersService.checkout(userId, dto.couponCode);
  }

  @Get('my-orders')
  getUserOrders(@CurrentUser('id') userId: string) {
    return this.ordersService.getUserOrders(userId);
  }

  @Get(':id')
  getOrderById(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
  ) {
    if (role === Role.ADMIN || role === Role.SUPER_ADMIN) {
      return this.ordersService.getOrderById(id); // Admin can view any order
    }
    return this.ordersService.getOrderById(id, userId); // User can view only their own order
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  getAllOrders() {
    return this.ordersService.getAllOrders();
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  updateOrder(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.updateOrder(id, updateOrderDto);
  }
}
