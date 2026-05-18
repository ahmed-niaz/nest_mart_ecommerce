import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module.js';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter.js';
import { TransformInterceptor } from './common/interceptors/transform.interceptor.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // Global prefix for all routes: /api/v1/... (excluding root '/')
  app.setGlobalPrefix('api/v1', {
    exclude: ['/'],
  });

  // Enable CORS for frontend
  app.enableCors({
    origin: process.env['CORS_ORIGIN'] || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  // Global validation pipe — auto-validates all incoming DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip unknown properties
      forbidNonWhitelisted: true, // Throw error on unknown properties
      transform: true, // Auto-transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global exception filter — standardized error responses
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global response interceptor — wrap responses in { success, data, message }
  app.useGlobalInterceptors(new TransformInterceptor());

  const port = process.env['PORT'] || 3001;
  await app.listen(port);

  logger.log(`🚀 NestMart API is running on: http://localhost:${port}/api/v1`);
  logger.log(`📋 Environment: ${process.env['NODE_ENV'] || 'development'}`);
}

bootstrap();
