import { UsersService } from './users.service.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getMyProfile(userId: string): Promise<{
        email: string;
        firstName: string | null;
        lastName: string | null;
        phone: string | null;
        id: string;
        avatar: string | null;
        role: import("../../../generated/prisma/index.js").$Enums.Role;
        isVerified: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateMyProfile(userId: string, dto: UpdateUserDto): Promise<{
        email: string;
        firstName: string | null;
        lastName: string | null;
        phone: string | null;
        id: string;
        avatar: string | null;
        role: import("../../../generated/prisma/index.js").$Enums.Role;
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
        role: import("../../../generated/prisma/index.js").$Enums.Role;
        isVerified: boolean;
        createdAt: Date;
    }[]>;
    updateRole(userId: string, role: string): Promise<{
        email: string;
        id: string;
        role: import("../../../generated/prisma/index.js").$Enums.Role;
    }>;
}
