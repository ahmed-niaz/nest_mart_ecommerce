import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { InventoryService } from './inventory.service.js';
import { CreateMovementDto } from './dto/create-movement.dto.js';
import { UpdateThresholdDto } from './dto/update-threshold.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Role } from '../../../generated/prisma/index.js';

@Controller('inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.STAFF, Role.SUPER_ADMIN)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('movements')
  create(@Req() req: any, @Body() dto: CreateMovementDto) {
    const userId = req.user?.id || null;
    return this.inventoryService.createMovement(userId, dto);
  }

  @Get('movements')
  findAll() {
    return this.inventoryService.getMovements();
  }

  @Get('movements/variant/:variantId')
  findByVariant(@Param('variantId') variantId: string) {
    return this.inventoryService.getMovementsByVariant(variantId);
  }

  @Get('low-stock')
  findLowStock() {
    return this.inventoryService.getLowStockAlerts();
  }

  @Patch('threshold/:variantId')
  updateThreshold(
    @Param('variantId') variantId: string,
    @Body() dto: UpdateThresholdDto,
  ) {
    return this.inventoryService.updateThreshold(
      variantId,
      dto.lowStockThreshold,
    );
  }
}
