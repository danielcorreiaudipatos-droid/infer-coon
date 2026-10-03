import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('OnCreators API')
    .setDescription('Premium Creator Marketplace - COON Ecosystem')
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('Auth', 'Authentication endpoints')
    .addTag('Creators', 'Creator management')
    .addTag('Subscriptions', 'Subscription management')
    .addTag('Payments', 'Payment processing')
    .addTag('Content', 'Content delivery')
    .addTag('Marketplace', 'Marketplace & products')
    .addTag('Analytics', 'Analytics & reports')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT || 3333;
  await app.listen(port);
  console.log(`\n✅ OnCreators API running on http://localhost:${port}`);
  console.log(`📚 Docs: http://localhost:${port}/docs\n`);
}

bootstrap().catch((err) => {
  console.error('❌ Failed to start:', err);
  process.exit(1);
});
