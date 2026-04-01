import 'reflect-metadata';

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';

import { AppModule } from './app.module';
import { resolveStorageRoot } from './storage/storage-path';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const port = Number(process.env.PORT ?? '3001');
  const publicAppUrl = process.env.PUBLIC_APP_URL ?? 'http://localhost:3000';
  const storageRoot = resolveStorageRoot(process.env.STORAGE_FILESYSTEM_ROOT);

  app.setGlobalPrefix('api');
  app.enableCors({
    origin: publicAppUrl,
    methods: ['GET', 'POST', 'PATCH'],
    allowedHeaders: ['Content-Type']
  });
  app.useStaticAssets(storageRoot, {
    prefix: '/uploads/'
  });

  await app.listen(port);

  Logger.log(`API listening on port ${port}`, 'Bootstrap');
}

void bootstrap();
