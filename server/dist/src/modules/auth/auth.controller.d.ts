import { AuthService } from './auth.service.js';
import { RegisterDto, LoginDto, GoogleLoginDto } from './dto/index.js';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: any;
            email: any;
            firstName: any;
            lastName: any;
            phone: any;
            avatar: any;
            role: any;
            isActive: any;
        };
    }>;
    login(dto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: any;
            email: any;
            firstName: any;
            lastName: any;
            phone: any;
            avatar: any;
            role: any;
            isActive: any;
        };
    }>;
    googleLogin(dto: GoogleLoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: any;
            email: any;
            firstName: any;
            lastName: any;
            phone: any;
            avatar: any;
            role: any;
            isActive: any;
        };
    }>;
    googleAuth(): Promise<void>;
    googleAuthCallback(req: any, res: any): Promise<any>;
    refreshTokens(userId: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    getProfile(userId: string): Promise<{
        id: any;
        email: any;
        firstName: any;
        lastName: any;
        phone: any;
        avatar: any;
        role: any;
        isActive: any;
    }>;
}
