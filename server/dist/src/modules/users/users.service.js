var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var UsersService_1;
import { Injectable, NotFoundException, ConflictException, Logger, } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
let UsersService = UsersService_1 = class UsersService {
    prisma;
    configService;
    logger = new Logger(UsersService_1.name);
    constructor(prisma, configService) {
        this.prisma = prisma;
        this.configService = configService;
    }
    async onModuleInit() {
        await this.bootstrapSuperAdmin();
    }
    async bootstrapSuperAdmin() {
        try {
            const email = this.configService.get('SUPER_ADMIN_EMAIL');
            const password = this.configService.get('SUPER_ADMIN_PASSWORD');
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
        }
        catch (error) {
            this.logger.error('Failed to bootstrap Super Admin', error);
        }
    }
    async findById(id) {
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
    async findByEmail(email) {
        return this.prisma.user.findUnique({
            where: { email },
            include: { profile: true },
        });
    }
    async updateProfile(userId, dto) {
        if (dto.phone) {
            const existingPhone = await this.prisma.profile.findFirst({
                where: {
                    phone: dto.phone,
                    NOT: { userId },
                },
            });
            if (existingPhone) {
                throw new ConflictException('This phone number is already in use by another account');
            }
        }
        if (dto.email) {
            const existingEmail = await this.prisma.user.findFirst({
                where: {
                    email: dto.email,
                    NOT: { id: userId },
                },
            });
            if (existingEmail) {
                throw new ConflictException('This email is already in use by another account');
            }
            await this.prisma.user.update({
                where: { id: userId },
                data: { email: dto.email },
            });
        }
        if (dto.address !== undefined ||
            dto.city !== undefined ||
            dto.postalCode !== undefined) {
            const defaultAddress = await this.prisma.address.findFirst({
                where: { userId, isDefault: true },
            });
            const addressData = {
                fullName: dto.firstName && dto.lastName
                    ? `${dto.firstName} ${dto.lastName}`
                    : defaultAddress?.fullName || 'N/A',
                phone: dto.phone || defaultAddress?.phone || 'N/A',
                address: dto.address !== undefined
                    ? dto.address
                    : defaultAddress?.address || 'N/A',
                city: dto.city !== undefined ? dto.city : defaultAddress?.city || 'N/A',
                postalCode: dto.postalCode !== undefined
                    ? dto.postalCode
                    : defaultAddress?.postalCode || 'N/A',
            };
            if (defaultAddress) {
                await this.prisma.address.update({
                    where: { id: defaultAddress.id },
                    data: addressData,
                });
            }
            else {
                await this.prisma.address.create({
                    data: {
                        ...addressData,
                        userId,
                        isDefault: true,
                    },
                });
            }
        }
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
    async updateRole(userId, role) {
        const user = await this.prisma.user.update({
            where: { id: userId },
            data: { role },
            include: { profile: true },
        });
        return this.mapUser(user);
    }
    mapUser(user) {
        if (!user)
            return null;
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
};
UsersService = UsersService_1 = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService,
        ConfigService])
], UsersService);
export { UsersService };
//# sourceMappingURL=users.service.js.map