import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../database/prisma.service.js';
import { RegisterDto, LoginDto } from './dto/index.js';
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    private readonly configService;
    private readonly logger;
    private readonly SALT_ROUNDS;
    constructor(prisma: PrismaService, jwtService: JwtService, configService: ConfigService);
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
    private mapUser;
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
    googleLogin(credential: string): Promise<{
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
    googleRedirectLogin(profile: any): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    private generateTokens;
}
