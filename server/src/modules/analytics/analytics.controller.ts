import {
  Controller,
  Get,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Role } from '../../../generated/prisma/index.js';

@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  getOverview() {
    return this.analyticsService.getOverview();
  }

  @Get('daily-sales')
  getDailySales() {
    return this.analyticsService.getDailySales();
  }

  @Get('top-products')
  getTopProducts(
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.analyticsService.getTopProducts(limit || 10);
  }
}
