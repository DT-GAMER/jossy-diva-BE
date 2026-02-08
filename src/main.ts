import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { ValidationPipe } from './common/pipes/validation.pipe';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('port') ?? 3000;
  app.enableShutdownHooks();

  /**
   * ------------------------------------------------------
   * GLOBAL PREFIX
   * ------------------------------------------------------
   * All routes will be prefixed with /api
   * Example:
   *   /api/v1/admin/products
   */
  app.setGlobalPrefix('api');

  /**
   * ------------------------------------------------------
   * API VERSIONING
   * ------------------------------------------------------
   * Enables @Version('1') on controllers & routes
   * URL-based versioning:
   *   /api/v1/...
   */
  app.enableVersioning({
    type: VersioningType.URI,
    prefix: 'v',
  });

  /**
   * ------------------------------------------------------
   * GLOBAL PIPES
   * ------------------------------------------------------
   * Enforces DTO validation everywhere
   */
  app.useGlobalPipes(new ValidationPipe());

  /**
   * ------------------------------------------------------
   * GLOBAL FILTERS
   * ------------------------------------------------------
   * Standardizes all error responses
   */
  app.useGlobalFilters(new HttpExceptionFilter());

  /**
   * ------------------------------------------------------
   * GLOBAL INTERCEPTORS
   * ------------------------------------------------------
   * Logging + response formatting
   */
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new ResponseInterceptor(),
  );

  /**
   * ------------------------------------------------------
   * CORS
   * ------------------------------------------------------
   * Allows admin dashboard & website access
   */
  app.enableCors({
    origin: true,
    credentials: true,
  });

  /**
   * ------------------------------------------------------
   * TRUST PROXY
   * ------------------------------------------------------
   * Important for deployments behind Nginx / Fly / Render
   */
  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  /**
   * ------------------------------------------------------
   * SWAGGER SETUP
   * ------------------------------------------------------
   * API documentation for admin + website
   */
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Jossy-Diva Collections API')
    .setDescription(
      'Backend API for inventory, sales, and website orders',
    )
    .setVersion('1.0')
    .addServer(
      `http://localhost:${port}`,
      'Local development',
    )
    .addServer(
      'https://magic.myradture.com',
      'Production',
    )
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'JWT-auth',
    )
    .addSecurityRequirements('JWT-auth')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      tryItOutEnabled: true,
    },
  });

  /**
   * ------------------------------------------------------
   * START SERVER
   * ------------------------------------------------------
   */
  await app.listen(port);

  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📚 Swagger docs available at /api/docs`);
}

bootstrap();
