import { Controller, Get, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Role } from '../../../generated/prisma/index.js';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * GET /users/me
   * Get current user's full profile
   */
  @Get('me')
  async getMyProfile(@CurrentUser('id') userId: string) {
    return this.usersService.findById(userId);
  }

  /**
   * PATCH /users/me
   * Update current user's profile
   */
  @Patch('me')
  async updateMyProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.updateProfile(userId, dto);
  }

  /**
   * GET /users
   * Get all users (Admin/SuperAdmin)
   */
  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async findAll() {
    return this.usersService.findAll();
  }

  /**
   * PATCH /users/:id/role
   * Update user role (SuperAdmin only)
   */
  @Patch(':id/role')
  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  async updateRole(@Param('id') userId: string, @Body('role') role: string) {
    return this.usersService.updateRole(userId, role);
  }
}
