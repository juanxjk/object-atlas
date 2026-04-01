import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { validateCreateObject, validateUpdateObject } from './object.validation';
import { ObjectsService } from './objects.service';

@Controller('objects')
export class ObjectsController {
  constructor(private readonly objectsService: ObjectsService) {}

  private static readonly allowedMimeTypes = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf'
  ]);

  @Get('_module')
  getModuleStatus() {
    return this.objectsService.getModuleStatus();
  }

  @Post()
  createObject(@Body() body: unknown) {
    return this.objectsService.create(validateCreateObject(body));
  }

  @Get()
  listObjects(@Query('q') searchQuery?: string) {
    return this.objectsService.list(searchQuery);
  }

  @Get(':id')
  getObject(@Param('id') id: string) {
    return this.objectsService.getById(id);
  }

  @Patch(':id')
  updateObject(@Param('id') id: string, @Body() body: unknown) {
    return this.objectsService.update(id, validateUpdateObject(body));
  }

  @Patch(':id/primary-media/:mediaId')
  setPrimaryMedia(@Param('id') id: string, @Param('mediaId') mediaId: string) {
    return this.objectsService.setPrimaryMedia(id, mediaId);
  }

  @Post(':id/media')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024,
        files: 1
      }
    })
  )
  uploadMedia(
    @Param('id') id: string,
    @UploadedFile()
    file?: {
      originalname: string;
      mimetype: string;
      size: number;
      buffer: Buffer;
    }
  ) {
    if (!file) {
      throw new BadRequestException('file is required');
    }

    if (!ObjectsController.allowedMimeTypes.has(file.mimetype)) {
      throw new BadRequestException('unsupported file type');
    }

    if (file.size > 10 * 1024 * 1024) {
      throw new BadRequestException('file is too large');
    }

    if (!file.originalname.trim()) {
      throw new BadRequestException('file name is required');
    }

    return this.objectsService.addMedia(id, file);
  }

  @Get(':id/media')
  listMedia(@Param('id') id: string) {
    return this.objectsService.listMedia(id);
  }
}
