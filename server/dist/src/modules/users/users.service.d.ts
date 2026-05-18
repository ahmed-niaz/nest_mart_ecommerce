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
        email: string;
        firstName: string | null;
        lastName: string | null;
        phone: string | null;
        id: string;
        avatar: string | null;
        role: import("generated/prisma/index.js").$Enums.Role;
        isVerified: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findByEmail(email: string): Promise<{
        email: string;
        password: string;
        firstName: string | null;
        lastName: string | null;
        phone: string | null;
        id: string;
        avatar: string | null;
        role: import("generated/prisma/index.js").$Enums.Role;
        isVerified: boolean;
        isActive: boolean;
        lastLoginAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    updateProfile(userId: string, dto: UpdateUserDto): Promise<{
        email: string;
        firstName: string | null;
        lastName: string | null;
        phone: string | null;
        id: string;
        avatar: string | null;
        role: import("generated/prisma/index.js").$Enums.Role;
        isVerified: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(): Promise<{
        email: string;
        firstName: string | null;
        lastName: string | null;
        phone: string | null;
        id: string;
        role: import("generated/prisma/index.js").$Enums.Role;
        isVerified: boolean;
        createdAt: Date;
    }[]>;
    updateRole(userId: string, role: any): Promise<{
        email: string;
        id: string;
        role: import("generated/prisma/index.js").$Enums.Role;
    }>;
}
