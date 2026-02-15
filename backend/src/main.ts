import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import * as helmet from 'helmet';
import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Security
  app.use(helmet.default());
  app.use(compression.default());
  app.use(cookieParser.default());

  // CORS - Allow both localhost and Codespaces URLs
  const frontendUrl = configService.get('FRONTEND_URL', 'http://localhost:8080');
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, etc.)
      if (!origin) return callback(null, true);
      // Allow localhost, codespaces, and configured frontend URL
      if (
        origin.includes('localhost') ||
        origin.includes('127.0.0.1') ||
        origin.includes('.app.github.dev') ||
        origin.includes('.github.dev') ||
        origin === frontendUrl
      ) {
        return callback(null, true);
      }
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // Global prefix
  const apiPrefix = configService.get('API_PREFIX', 'api/v1');
  app.setGlobalPrefix(apiPrefix);

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle('LiveSpark API')
    .setDescription('Social Live Streaming Platform API')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication & Registration')
    .addTag('users', 'User Management')
    .addTag('profiles', 'Profile Management')
    .addTag('videos', 'Short Video System')
    .addTag('live', 'Live Streaming')
    .addTag('pk-battles', 'PK Battle System')
    .addTag('chat', 'Chat & Messaging')
    .addTag('party-rooms', 'Audio Party Rooms')
    .addTag('gifts', 'Gift Catalog')
    .addTag('wallet', 'Coins & Wallet')
    .addTag('payments', 'Payment Gateways')
    .addTag('reports', 'Reporting & Moderation')
    .addTag('agencies', 'Agency Management')
    .addTag('shop', 'Ecommerce & Live Shopping')
    .addTag('notifications', 'Notifications')
    .addTag('admin', 'Admin Panel')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  const port = configService.get('PORT', 3000);
  await app.listen(port);
  console.log(`🚀 LiveSpark API running on http://localhost:${port}`);
  console.log(`📚 Swagger docs at http://localhost:${port}/docs`);
}

bootstrap();
