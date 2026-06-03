var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller.js';
import { DatabaseModule } from './database/database.module.js';
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
import { LatestProductsModule } from './modules/latest-products/latest-products.module.js';
import { PaymentsModule } from './modules/payments/payments.module.js';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard.js';
import { RolesGuard } from './common/guards/roles.guard.js';
let AppModule = class AppModule {
};
AppModule = __decorate([
    Module({
        imports: [
            ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            ThrottlerModule.forRoot([
                {
                    ttl: 60000,
                    limit: 100,
                },
            ]),
            DatabaseModule,
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
            LatestProductsModule,
            PaymentsModule,
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
            {
                provide: APP_GUARD,
                useClass: ThrottlerGuard,
            },
        ],
    })
], AppModule);
export { AppModule };
//# sourceMappingURL=app.module.js.map