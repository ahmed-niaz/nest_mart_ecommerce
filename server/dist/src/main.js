import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module.js';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter.js';
import { TransformInterceptor } from './common/interceptors/transform.interceptor.js';
async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const logger = new Logger('Bootstrap');
    app.setGlobalPrefix('api/v1');
    app.enableCors({
        origin: process.env['CORS_ORIGIN'] || 'http://localhost:3000',
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    });
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    app.useGlobalFilters(new AllExceptionsFilter());
    app.useGlobalInterceptors(new TransformInterceptor());
    const port = process.env['PORT'] || 3001;
    await app.listen(port);
    logger.log(`🚀 NestMart API is running on: http://localhost:${port}/api/v1`);
    logger.log(`📋 Environment: ${process.env['NODE_ENV'] || 'development'}`);
}
bootstrap();
//# sourceMappingURL=main.js.map