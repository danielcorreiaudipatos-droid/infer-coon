import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as helmet from 'helmet';
import { AppModule } from './app.module';
import { initSentry } from './config/sentry.config';

async function bootstrap() {
  // Initialize Sentry for error tracking
  if (process.env.SENTRY_DSN) {
    initSentry();
  }

  const app = await NestFactory.create(AppModule);

  // Security
  app.use(helmet());

  // CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') || '*',
    credentials: true,
  });

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('Infer Coon API')
    .setDescription('Unified ad management, sales automation & creator platform')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`
    ╔════════════════════════════════════════════════════════╗
    ║  🚀 Infer Coon Server Started                          ║
    ║  🌐 URL: http://localhost:${port}                       ║
    ║  📚 Swagger Docs: http://localhost:${port}/api           ║
    ║  ✅ Ready for execution!                               ║
    ╚════════════════════════════════════════════════════════╝
  `);
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
