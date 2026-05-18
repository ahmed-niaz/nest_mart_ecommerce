import { Controller, Get, Post, Body, UseGuards, BadRequestException } from '@nestjs/common';
import { CollectionsService } from './collections.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Role } from '../../../generated/prisma/index.js';
import { Public } from '../../common/decorators/public.decorator.js';

@Controller('collections')
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Get()
  @Public()
  findAll() {
    return this.collectionsService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  create(@Body() body: { title: string; description?: string; image?: string; themeTemplate?: string; productIds?: string[] }) {
    if (!body.title) {
      throw new BadRequestException('Collection title is required');
    }
    return this.collectionsService.create(body.title, body.description, body.image, body.themeTemplate, body.productIds);
  }
}
