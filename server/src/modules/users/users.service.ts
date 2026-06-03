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
        this.logger.warn(
          'SUPER_ADMIN_EMAIL or SUPER_ADMIN_PASSWORD not set. Skipping Super Admin bootstrap.',
        );
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
          passwordHash: hashedPassword,
          role: 'SUPER_ADMIN',
          isActive: true,
          profile: {
            create: {
              firstName: 'Super',
              lastName: 'Admin',
            },
          },
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
      include: {
        profile: true,
        addresses: {
          where: { isDefault: true },
          take: 1,
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.mapUser(user);
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, dto: UpdateUserDto) {
    // Check phone uniqueness if updating phone
    if (dto.phone) {
      const existingPhone = await this.prisma.profile.findFirst({
        where: {
          phone: dto.phone,
          NOT: { userId },
        },
      });

      if (existingPhone) {
        throw new ConflictException(
          'This phone number is already in use by another account',
        );
      }
    }

    // Check email uniqueness if updating email
    if (dto.email) {
      const existingEmail = await this.prisma.user.findFirst({
        where: {
          email: dto.email,
          NOT: { id: userId },
        },
      });

      if (existingEmail) {
        throw new ConflictException(
          'This email is already in use by another account',
        );
      }

      await this.prisma.user.update({
        where: { id: userId },
        data: { email: dto.email },
      });
    }

    // Handle address
    if (
      dto.address !== undefined ||
      dto.city !== undefined ||
      dto.postalCode !== undefined
    ) {
      const defaultAddress = await this.prisma.address.findFirst({
        where: { userId, isDefault: true },
      });

      const addressData = {
        fullName:
          dto.firstName && dto.lastName
            ? `${dto.firstName} ${dto.lastName}`
            : defaultAddress?.fullName || 'N/A',
        phone: dto.phone || defaultAddress?.phone || 'N/A',
        address:
          dto.address !== undefined
            ? dto.address
            : defaultAddress?.address || 'N/A',
        city: dto.city !== undefined ? dto.city : defaultAddress?.city || 'N/A',
        postalCode:
          dto.postalCode !== undefined
            ? dto.postalCode
            : defaultAddress?.postalCode || 'N/A',
      };

      if (defaultAddress) {
        await this.prisma.address.update({
          where: { id: defaultAddress.id },
          data: addressData,
        });
      } else {
        await this.prisma.address.create({
          data: {
            ...addressData,
            userId,
            isDefault: true,
          },
        });
      }
    }

    // Upsert profile
    await this.prisma.profile.upsert({
      where: { userId },
      create: {
        userId,
        ...(dto.firstName !== undefined && { firstName: dto.firstName }),
        ...(dto.lastName !== undefined && { lastName: dto.lastName }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.avatar !== undefined && { avatarUrl: dto.avatar }),
      },
      update: {
        ...(dto.firstName !== undefined && { firstName: dto.firstName }),
        ...(dto.lastName !== undefined && { lastName: dto.lastName }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.avatar !== undefined && { avatarUrl: dto.avatar }),
      },
    });

    return this.findById(userId);
  }

  /**
   * Find all users
   */
  async findAll() {
    const users = await this.prisma.user.findMany({
      include: {
        profile: true,
        addresses: {
          where: { isDefault: true },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return users.map((u) => this.mapUser(u));
  }

  /**
   * Update user role
   */
  async updateRole(userId: string, role: any) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { role },
      include: { profile: true },
    });

    return this.mapUser(user);
  }

  private mapUser(user: any) {
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      firstName: user.profile?.firstName,
      lastName: user.profile?.lastName,
      phone: user.profile?.phone,
      avatar: user.profile?.avatarUrl,
      role: user.role,
      isActive: user.isActive,
      isVerified: user.isVerified ?? false,
      address: user.addresses?.[0]?.address || '',
      city: user.addresses?.[0]?.city || '',
      postalCode: user.addresses?.[0]?.postalCode || '',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
