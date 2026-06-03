import { OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { ConfigService } from '@nestjs/config';
export declare class UsersService implements OnModuleInit {
    private readonly prisma;
    private readonly configService;
    private readonly logger;
    constructor(prisma: PrismaService, configService: ConfigService);
    onModuleInit(): Promise<void>;
    private bootstrapSuperAdmin;
    findById(id: string): Promise<{
        id: any;
        email: any;
        firstName: any;
        lastName: any;
        phone: any;
        avatar: any;
        role: any;
        isActive: any;
        isVerified: any;
        address: any;
        city: any;
        postalCode: any;
        createdAt: any;
        updatedAt: any;
    } | null>;
    findByEmail(email: string): Promise<({
        profile: {
            id: string;
            userId: string;
            firstName: string | null;
            lastName: string | null;
            phone: string | null;
            avatarUrl: string | null;
        } | null;
    } & {
        id: string;
        email: string;
        passwordHash: string;
        role: import("generated/prisma/index.js").$Enums.Role;
        isActive: boolean;
        isVerified: boolean;
        lastLoginAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }) | null>;
    updateProfile(userId: string, dto: UpdateUserDto): Promise<{
        id: any;
        email: any;
        firstName: any;
        lastName: any;
        phone: any;
        avatar: any;
        role: any;
        isActive: any;
        isVerified: any;
        address: any;
        city: any;
        postalCode: any;
        createdAt: any;
        updatedAt: any;
    } | null>;
    findAll(): Promise<({
        id: any;
        email: any;
        firstName: any;
        lastName: any;
        phone: any;
        avatar: any;
        role: any;
        isActive: any;
        isVerified: any;
        address: any;
        city: any;
        postalCode: any;
        createdAt: any;
        updatedAt: any;
    } | null)[]>;
    updateRole(userId: string, role: any): Promise<{
        id: any;
        email: any;
        firstName: any;
        lastName: any;
        phone: any;
        avatar: any;
        role: any;
        isActive: any;
        isVerified: any;
        address: any;
        city: any;
        postalCode: any;
        createdAt: any;
        updatedAt: any;
    } | null>;
    private mapUser;
}
