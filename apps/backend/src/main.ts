import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Global API prefix
  app.setGlobalPrefix('api');

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('WealthSutra API')
    .setDescription(
      'NestJS backend for WealthSutra financial planning app. Includes transaction ingestion, dashboard summarization, and multi-agent planning using OpenAI.',
    )
    .setVersion('1.0')
    .addTag('Users', 'User management endpoints')
    .addTag('Profiles', 'User profile endpoints')
    .addTag('Transactions', 'Transaction ingestion and retrieval')
    .addTag('Dashboard', 'Dashboard summarization')
    .addTag('Goals', 'Financial goals management')
    .addTag('Plans', 'Financial plans management')
    .addTag('Agent', 'Multi-agent orchestration for plan generation')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'WealthSutra API Docs',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  const port = process.env.PORT || 4000;
  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/api/docs`);
}

bootstrap();

