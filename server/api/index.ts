import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from '../src/app.module.js';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter.js';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor.js';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

const expressApp = express();

let cachedApp: any;

async function bootstrap() {
  if (!cachedApp) {
    const app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(expressApp)
    );
    const logger = new Logger('Bootstrap (Vercel)');

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

    await app.init();
    cachedApp = app;
    logger.log(`🚀 NestMart API (Serverless) initialized successfully`);
  }
  return cachedApp;
}

export default async (req: any, res: any) => {
  await bootstrap();
  expressApp(req, res);
};
