import { AuthService } from './auth.service.js';
import { RegisterDto, LoginDto, GoogleLoginDto } from './dto/index.js';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            email: string;
            firstName: string | null;
            lastName: string | null;
            phone: string | null;
            id: string;
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
    googleLogin(dto: GoogleLoginDto): Promise<{
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
    googleAuth(req: any): Promise<void>;
    googleAuthCallback(req: any, res: any): Promise<any>;
    refreshTokens(userId: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    getProfile(userId: string): Promise<{
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
}
