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

  @Post(':id/media')
  @UseInterceptors(FileInterceptor('file'))
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

    if (!['image/jpeg', 'image/png', 'image/webp', 'application/pdf'].includes(file.mimetype)) {
      throw new BadRequestException('unsupported file type');
    }

    if (file.size > 10 * 1024 * 1024) {
      throw new BadRequestException('file is too large');
    }

    return this.objectsService.addMedia(id, file);
  }

  @Get(':id/media')
  listMedia(@Param('id') id: string) {
    return this.objectsService.listMedia(id);
  }
}
