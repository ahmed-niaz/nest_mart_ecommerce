import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

// Root controller
import { AppController } from './app.controller.js';

// Database
import { DatabaseModule } from './database/database.module.js';

// Feature modules
import { AuthModule } from './modules/auth/auth.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { CategoriesModule } from './modules/categories/categories.module.js';
import { ProductsModule } from './modules/products/products.module.js';
import { CartModule } from './modules/cart/cart.module.js';
import { WishlistModule } from './modules/wishlist/wishlist.module.js';
import { OrdersModule } from './modules/orders/orders.module.js';
import { ReviewsModule } from './modules/reviews/reviews.module.js';
import { AuditModule } from './modules/audit/audit.module.js';
import { UploadModule } from './modules/upload/upload.module.js';
import { CouponsModule } from './modules/coupons/coupons.module.js';
import { InventoryModule } from './modules/inventory/inventory.module.js';
import { AnalyticsModule } from './modules/analytics/analytics.module.js';
import { ProductImagesModule } from './modules/product-images/product-images.module.js';

// Guards
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard.js';
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
    CategoriesModule,
    ProductsModule,
    CartModule,
    WishlistModule,
    OrdersModule,
    ReviewsModule,
    AuditModule,
    UploadModule,
    CouponsModule,
    InventoryModule,
    AnalyticsModule,
    ProductImagesModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
