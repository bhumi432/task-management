import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableShutdownHooks();

  app.enableCors({
    origin: 'https://task-management-frontend-production-a475.up.railway.app',
    credentials: true,
    methods: ['POST', 'GET', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true
    })
  );

  const config = app.get(ConfigService);
  const port = config.get<number>('PORT') ?? 3000;

  await app.listen(port);
}

void bootstrap();

