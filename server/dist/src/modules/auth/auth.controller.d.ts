import { AuthService } from './auth.service.js';
import { RegisterDto, LoginDto } from './dto/index.js';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            phone: string | null;
            firstName: string | null;
            lastName: string | null;
            avatar: string | null;
            role: import("generated/prisma/index.js").$Enums.Role;
            isVerified: boolean;
            createdAt: Date;
        };
    }>;
    login(dto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            firstName: string | null;
            lastName: string | null;
            phone: string | null;
            avatar: string | null;
            role: import("generated/prisma/index.js").$Enums.Role;
            isVerified: boolean;
        };
    }>;
    refreshTokens(userId: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    getProfile(userId: string): Promise<{
        id: string;
        email: string;
        phone: string | null;
        firstName: string | null;
        lastName: string | null;
        avatar: string | null;
        role: import("generated/prisma/index.js").$Enums.Role;
        isVerified: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
