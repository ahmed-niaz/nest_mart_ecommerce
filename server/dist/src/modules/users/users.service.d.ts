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
        createdAt: any;
        updatedAt: any;
    } | null>;
    findByEmail(email: string): Promise<({
        profile: {
            firstName: string | null;
            lastName: string | null;
            phone: string | null;
            id: string;
            userId: string;
            avatarUrl: string | null;
        } | null;
    } & {
        email: string;
        id: string;
        passwordHash: string;
        role: import("generated/prisma/index.js").$Enums.Role;
        isActive: boolean;
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
        createdAt: any;
        updatedAt: any;
    } | null>;
    private mapUser;
}
