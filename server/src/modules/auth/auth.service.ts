import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../database/prisma.service.js';
import { RegisterDto, LoginDto } from './dto/index.js';
import type { JwtPayload } from './strategies/jwt.strategy.js';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly SALT_ROUNDS = 12;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Register a new user
   */
  async register(dto: RegisterDto) {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('An account with this email already exists');
    }

    // Check phone uniqueness if provided
    if (dto.phone) {
      const existingPhone = await this.prisma.profile.findFirst({
        where: { phone: dto.phone },
      });

      if (existingPhone) {
        throw new ConflictException(
          'An account with this phone number already exists',
        );
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, this.SALT_ROUNDS);

    // Create user
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

    // Generate tokens
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

  /**
   * Login with email and password
   */
  async login(dto: LoginDto) {
    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { profile: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedException(
        'Your account has been deactivated. Please contact support.',
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Update last login timestamp
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate tokens
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

  private mapUser(user: any) {
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

  /**
   * Refresh access token using refresh token
   */
  async refreshTokens(userId: string) {
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

  /**
   * Get current user profile
   */
  async getProfile(userId: string) {
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

  /**
   * Login or Register user using Google token (ID Token or Access Token)
   */
  async googleLogin(credential: string) {
    let payload: {
      email: string;
      firstName?: string;
      lastName?: string;
      avatar?: string;
      googleId?: string;
    };

    try {
      // Google ID tokens are JWTs which always start with 'eyJ'
      if (credential.startsWith('eyJ')) {
        const tokenInfoRes = await fetch(
          `https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`,
        );
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
      } else {
        // Fallback to access_token flow (userinfo API)
        const userInfoRes = await fetch(
          'https://www.googleapis.com/oauth2/v3/userinfo',
          {
            headers: { Authorization: `Bearer ${credential}` },
          },
        );
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
    } catch (error) {
      this.logger.error('Google token verification failed', error);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Failed to verify Google token');
    }

    if (!payload.email) {
      throw new UnauthorizedException(
        'Google account must have an email address',
      );
    }

    // Find or create user
    let user = await this.prisma.user.findUnique({
      where: { email: payload.email },
      include: { profile: true },
    });

    if (!user) {
      // Generate a random secure password for social auth user
      const randomPassword = await bcrypt.hash(
        Math.random().toString(36).substring(2) + Date.now().toString(36),
        this.SALT_ROUNDS,
      );
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
    } else {
      // Update missing profile info if any
      const updateData: Record<string, any> = {};
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
        } else {
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
          throw new UnauthorizedException(
            'User profile update failed: user not found',
          );
        }
      }

      // Update last login timestamp
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
        include: { profile: true },
      });

      this.logger.log(`User logged in via Google: ${user.email}`);
    }

    if (!user) {
      throw new UnauthorizedException(
        'Google authentication failed: user not found',
      );
    }

    if (!user.isActive) {
      throw new UnauthorizedException(
        'Your account has been deactivated. Please contact support.',
      );
    }

    // Generate tokens
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

  /**
   * Login or Register user using redirect-based Google strategy profile
   */
  async googleRedirectLogin(profile: any) {
    if (!profile || !profile.email) {
      throw new UnauthorizedException('Google authentication failed');
    }

    let user = await this.prisma.user.findUnique({
      where: { email: profile.email },
      include: { profile: true },
    });

    if (!user) {
      // Generate a random secure password for social auth user
      const randomPassword = await bcrypt.hash(
        Math.random().toString(36).substring(2) + Date.now().toString(36),
        this.SALT_ROUNDS,
      );
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
    } else {
      // Update missing profile info if any
      const updateData: Record<string, any> = {};
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
        } else {
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
          throw new UnauthorizedException(
            'User profile update failed: user not found',
          );
        }
      }

      // Update last login timestamp
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
        include: { profile: true },
      });

      this.logger.log(`User logged in via Google redirect: ${user.email}`);
    }

    if (!user) {
      throw new UnauthorizedException(
        'Google authentication failed: user not found',
      );
    }

    if (!user.isActive) {
      throw new UnauthorizedException(
        'Your account has been deactivated. Please contact support.',
      );
    }

    return this.generateTokens({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
  }

  /**
   * Generate access and refresh JWT tokens
   */
  private async generateTokens(payload: JwtPayload) {
    const tokenPayload = { ...payload } as Record<string, unknown>;

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(tokenPayload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: this.configService.get<string>(
          'JWT_EXPIRATION',
          '15m',
        ) as any,
      }),
      this.jwtService.signAsync(tokenPayload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>(
          'JWT_REFRESH_EXPIRATION',
          '7d',
        ) as any,
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
