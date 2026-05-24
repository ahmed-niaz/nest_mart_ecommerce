var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AuthService_1;
import { Injectable, ConflictException, UnauthorizedException, Logger, } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../database/prisma.service.js';
let AuthService = AuthService_1 = class AuthService {
    prisma;
    jwtService;
    configService;
    logger = new Logger(AuthService_1.name);
    SALT_ROUNDS = 12;
    constructor(prisma, jwtService, configService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
    }
    async register(dto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (existingUser) {
            throw new ConflictException('An account with this email already exists');
        }
        if (dto.phone) {
            const existingPhone = await this.prisma.profile.findFirst({
                where: { phone: dto.phone },
            });
            if (existingPhone) {
                throw new ConflictException('An account with this phone number already exists');
            }
        }
        const hashedPassword = await bcrypt.hash(dto.password, this.SALT_ROUNDS);
        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                passwordHash: hashedPassword,
                profile: {
                    create: {
                        firstName: dto.firstName,
                        lastName: dto.lastName,
                        phone: dto.phone,
                    },
                },
            },
            include: {
                profile: true,
            },
        });
        const tokens = await this.generateTokens({
            sub: user.id,
            email: user.email,
            role: user.role,
        });
        this.logger.log(`New user registered: ${user.email}`);
        return {
            user: this.mapUser(user),
            ...tokens,
        };
    }
    async login(dto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
            include: { profile: true },
        });
        if (!user) {
            throw new UnauthorizedException('Invalid email or password');
        }
        if (!user.isActive) {
            throw new UnauthorizedException('Your account has been deactivated. Please contact support.');
        }
        const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid email or password');
        }
        await this.prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });
        const tokens = await this.generateTokens({
            sub: user.id,
            email: user.email,
            role: user.role,
        });
        this.logger.log(`User logged in: ${user.email}`);
        return {
            user: this.mapUser(user),
            ...tokens,
        };
    }
    mapUser(user) {
        return {
            id: user.id,
            email: user.email,
            firstName: user.profile?.firstName,
            lastName: user.profile?.lastName,
            phone: user.profile?.phone,
            avatar: user.profile?.avatarUrl,
            role: user.role,
            isActive: user.isActive,
        };
    }
    async refreshTokens(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                role: true,
                isActive: true,
            },
        });
        if (!user || !user.isActive) {
            throw new UnauthorizedException('Invalid refresh token');
        }
        const tokens = await this.generateTokens({
            sub: user.id,
            email: user.email,
            role: user.role,
        });
        return tokens;
    }
    async getProfile(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                profile: true,
            },
        });
        if (!user) {
            throw new UnauthorizedException('User not found');
        }
        return this.mapUser(user);
    }
    async googleLogin(credential) {
        let payload;
        try {
            if (credential.startsWith('eyJ')) {
                const tokenInfoRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
                if (!tokenInfoRes.ok) {
                    throw new UnauthorizedException('Invalid Google ID Token');
                }
                const tokenInfo = await tokenInfoRes.json();
                payload = {
                    email: tokenInfo.email,
                    firstName: tokenInfo.given_name,
                    lastName: tokenInfo.family_name,
                    avatar: tokenInfo.picture,
                    googleId: tokenInfo.sub,
                };
            }
            else {
                const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${credential}` },
                });
                if (!userInfoRes.ok) {
                    throw new UnauthorizedException('Invalid Google Access Token');
                }
                const userInfo = await userInfoRes.json();
                payload = {
                    email: userInfo.email,
                    firstName: userInfo.given_name,
                    lastName: userInfo.family_name,
                    avatar: userInfo.picture,
                    googleId: userInfo.sub,
                };
            }
        }
        catch (error) {
            this.logger.error('Google token verification failed', error);
            if (error instanceof UnauthorizedException) {
                throw error;
            }
            throw new UnauthorizedException('Failed to verify Google token');
        }
        if (!payload.email) {
            throw new UnauthorizedException('Google account must have an email address');
        }
        let user = await this.prisma.user.findUnique({
            where: { email: payload.email },
            include: { profile: true },
        });
        if (!user) {
            const randomPassword = await bcrypt.hash(Math.random().toString(36).substring(2) + Date.now().toString(36), this.SALT_ROUNDS);
            user = await this.prisma.user.create({
                data: {
                    email: payload.email,
                    passwordHash: randomPassword,
                    isActive: true,
                    profile: {
                        create: {
                            firstName: payload.firstName || null,
                            lastName: payload.lastName || null,
                            avatarUrl: payload.avatar || null,
                        },
                    },
                },
                include: { profile: true },
            });
            this.logger.log(`New user registered via Google: ${user.email}`);
        }
        else {
            const updateData = {};
            if (!user.profile?.firstName && payload.firstName)
                updateData.firstName = payload.firstName;
            if (!user.profile?.lastName && payload.lastName)
                updateData.lastName = payload.lastName;
            if (!user.profile?.avatarUrl && payload.avatar)
                updateData.avatarUrl = payload.avatar;
            if (Object.keys(updateData).length > 0) {
                if (user.profile) {
                    await this.prisma.profile.update({
                        where: { userId: user.id },
                        data: updateData,
                    });
                }
                else {
                    await this.prisma.profile.create({
                        data: {
                            userId: user.id,
                            ...updateData,
                        },
                    });
                }
                user = await this.prisma.user.findUnique({
                    where: { id: user.id },
                    include: { profile: true },
                });
                if (!user) {
                    throw new UnauthorizedException('User profile update failed: user not found');
                }
            }
            user = await this.prisma.user.update({
                where: { id: user.id },
                data: { lastLoginAt: new Date() },
                include: { profile: true },
            });
            this.logger.log(`User logged in via Google: ${user.email}`);
        }
        if (!user) {
            throw new UnauthorizedException('Google authentication failed: user not found');
        }
        if (!user.isActive) {
            throw new UnauthorizedException('Your account has been deactivated. Please contact support.');
        }
        const tokens = await this.generateTokens({
            sub: user.id,
            email: user.email,
            role: user.role,
        });
        return {
            user: this.mapUser(user),
            ...tokens,
        };
    }
    async googleRedirectLogin(profile) {
        if (!profile || !profile.email) {
            throw new UnauthorizedException('Google authentication failed');
        }
        let user = await this.prisma.user.findUnique({
            where: { email: profile.email },
            include: { profile: true },
        });
        if (!user) {
            const randomPassword = await bcrypt.hash(Math.random().toString(36).substring(2) + Date.now().toString(36), this.SALT_ROUNDS);
            user = await this.prisma.user.create({
                data: {
                    email: profile.email,
                    passwordHash: randomPassword,
                    isActive: true,
                    profile: {
                        create: {
                            firstName: profile.firstName || null,
                            lastName: profile.lastName || null,
                            avatarUrl: profile.avatar || null,
                        },
                    },
                },
                include: { profile: true },
            });
            this.logger.log(`New user registered via Google redirect: ${user.email}`);
        }
        else {
            const updateData = {};
            if (!user.profile?.firstName && profile.firstName)
                updateData.firstName = profile.firstName;
            if (!user.profile?.lastName && profile.lastName)
                updateData.lastName = profile.lastName;
            if (!user.profile?.avatarUrl && profile.avatar)
                updateData.avatarUrl = profile.avatar;
            if (Object.keys(updateData).length > 0) {
                if (user.profile) {
                    await this.prisma.profile.update({
                        where: { userId: user.id },
                        data: updateData,
                    });
                }
                else {
                    await this.prisma.profile.create({
                        data: {
                            userId: user.id,
                            ...updateData,
                        },
                    });
                }
                user = await this.prisma.user.findUnique({
                    where: { id: user.id },
                    include: { profile: true },
                });
                if (!user) {
                    throw new UnauthorizedException('User profile update failed: user not found');
                }
            }
            user = await this.prisma.user.update({
                where: { id: user.id },
                data: { lastLoginAt: new Date() },
                include: { profile: true },
            });
            this.logger.log(`User logged in via Google redirect: ${user.email}`);
        }
        if (!user) {
            throw new UnauthorizedException('Google authentication failed: user not found');
        }
        if (!user.isActive) {
            throw new UnauthorizedException('Your account has been deactivated. Please contact support.');
        }
        return this.generateTokens({
            sub: user.id,
            email: user.email,
            role: user.role,
        });
    }
    async generateTokens(payload) {
        const tokenPayload = { ...payload };
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(tokenPayload, {
                secret: this.configService.get('JWT_SECRET'),
                expiresIn: this.configService.get('JWT_EXPIRATION', '15m'),
            }),
            this.jwtService.signAsync(tokenPayload, {
                secret: this.configService.get('JWT_REFRESH_SECRET'),
                expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION', '7d'),
            }),
        ]);
        return {
            accessToken,
            refreshToken,
        };
    }
};
AuthService = AuthService_1 = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService,
        JwtService,
        ConfigService])
], AuthService);
export { AuthService };
//# sourceMappingURL=auth.service.js.map