import {
  Injectable,
  NotFoundException,
  ConflictException,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService implements OnModuleInit {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.bootstrapSuperAdmin();
  }

  private async bootstrapSuperAdmin() {
    try {
      const email = this.configService.get<string>('SUPER_ADMIN_EMAIL');
      const password = this.configService.get<string>('SUPER_ADMIN_PASSWORD');

      if (!email || !password) {
        this.logger.warn('SUPER_ADMIN_EMAIL or SUPER_ADMIN_PASSWORD not set. Skipping Super Admin bootstrap.');
        return;
      }

      const existingAdmin = await this.prisma.user.findFirst({
        where: { role: 'SUPER_ADMIN' },
      });

      if (existingAdmin) {
        this.logger.log('Super Admin account already exists.');
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      await this.prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName: 'Super',
          lastName: 'Admin',
          role: 'SUPER_ADMIN',
          isVerified: true,
        },
      });

      this.logger.log(`Super Admin created successfully with email: ${email}`);
    } catch (error) {
      this.logger.error('Failed to bootstrap Super Admin', error);
    }
  }

  /**
   * Find user by ID
   */
  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        role: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, dto: UpdateUserDto) {
    // Check phone uniqueness if updating phone
    if (dto.phone) {
      const existingPhone = await this.prisma.user.findFirst({
        where: {
          phone: dto.phone,
          NOT: { id: userId },
        },
      });

      if (existingPhone) {
        throw new ConflictException(
          'This phone number is already in use by another account',
        );
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.firstName !== undefined && { firstName: dto.firstName }),
        ...(dto.lastName !== undefined && { lastName: dto.lastName }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.avatar !== undefined && { avatar: dto.avatar }),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        role: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }
  /**
   * Find all users
   */
  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isVerified: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Update user role
   */
  async updateRole(userId: string, role: any) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });
  }
}
