import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';

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
  listObjects() {
    return this.objectsService.list();
  }

  @Get(':id')
  getObject(@Param('id') id: string) {
    return this.objectsService.getById(id);
  }

  @Patch(':id')
  updateObject(@Param('id') id: string, @Body() body: unknown) {
    return this.objectsService.update(id, validateUpdateObject(body));
  }
}
