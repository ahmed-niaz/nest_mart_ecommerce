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
                    password: hashedPassword,
                    firstName: 'Super',
                    lastName: 'Admin',
                    role: 'SUPER_ADMIN',
                    isVerified: true,
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
    async findByEmail(email) {
        return this.prisma.user.findUnique({
            where: { email },
        });
    }
    async updateProfile(userId, dto) {
        if (dto.phone) {
            const existingPhone = await this.prisma.user.findFirst({
                where: {
                    phone: dto.phone,
                    NOT: { id: userId },
                },
            });
            if (existingPhone) {
                throw new ConflictException('This phone number is already in use by another account');
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
    async updateRole(userId, role) {
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
};
UsersService = UsersService_1 = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService,
        ConfigService])
], UsersService);
export { UsersService };
//# sourceMappingURL=users.service.js.map