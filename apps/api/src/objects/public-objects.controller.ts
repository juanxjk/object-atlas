import { Controller, Get, Param } from '@nestjs/common';

import { ObjectsService } from './objects.service';

@Controller('public/objects')
export class PublicObjectsController {
  constructor(private readonly objectsService: ObjectsService) {}

  @Get(':publicId')
  getPublicObject(@Param('publicId') publicId: string) {
    return this.objectsService.getPublicObject(publicId);
  }
}
