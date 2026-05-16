import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

// Database
import { DatabaseModule } from './database/database.module.js';

// Auth
import { AuthModule } from './modules/auth/auth.module.js';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard.js';

// Users
import { UsersModule } from './modules/users/users.module.js';

// Guards
import { RolesGuard } from './common/guards/roles.guard.js';

@Module({
  imports: [
    // Load .env globally
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Database (Prisma)
    DatabaseModule,

    // Feature modules
    AuthModule,
    UsersModule,
  ],
  providers: [
    // Global JWT Auth Guard — all routes require auth by default
    // Use @Public() decorator to make specific routes public
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Global Roles Guard — works with @Roles() decorator
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
