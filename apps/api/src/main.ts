import 'reflect-metadata';

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const port = Number(process.env.PORT ?? '3001');
  const publicAppUrl = process.env.PUBLIC_APP_URL ?? 'http://localhost:3000';

  app.setGlobalPrefix('api');
  app.enableCors({
    origin: publicAppUrl
  });

  await app.listen(port);

  Logger.log(`API listening on port ${port}`, 'Bootstrap');
}

void bootstrap();
