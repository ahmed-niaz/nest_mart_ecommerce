import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
  Res,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service.js';
import { RegisterDto, LoginDto, GoogleLoginDto } from './dto/index.js';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard.js';
import { Public } from '../../common/decorators/public.decorator.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /auth/register
   * Register a new user account
   */
  @Public()
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  /**
   * POST /auth/login
   * Login with email and password
   */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  /**
   * POST /auth/google
   * Login/Register with Google token (ID Token or Access Token)
   */
  @Public()
  @Post('google')
  @HttpCode(HttpStatus.OK)
  async googleLogin(@Body() dto: GoogleLoginDto) {
    return this.authService.googleLogin(dto.credential);
  }

  /**
   * GET /auth/google
   * Redirect user to Google OAuth screen
   */
  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req: any) {
    // Passport will handle redirect
  }

  /**
   * GET /auth/google/callback
   * Callback URL for Google OAuth redirect flow
   */
  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req: any, @Res() res: any) {
    try {
      const tokens = await this.authService.googleRedirectLogin(req.user);
      const clientUrl = process.env['CLIENT_URL'] || 'http://localhost:3000';
      return res.redirect(
        `${clientUrl}/login?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`,
      );
    } catch (err) {
      const clientUrl = process.env['CLIENT_URL'] || 'http://localhost:3000';
      return res.redirect(
        `${clientUrl}/login?error=Google authentication failed`,
      );
    }
  }

  /**
   * POST /auth/refresh
   * Refresh access token using refresh token
   */
  @Public()
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshTokens(@CurrentUser('id') userId: string) {
    return this.authService.refreshTokens(userId);
  }

  /**
   * GET /auth/me
   * Get current authenticated user profile
   */
  @Get('me')
  async getProfile(@CurrentUser('id') userId: string) {
    return this.authService.getProfile(userId);
  }
}

