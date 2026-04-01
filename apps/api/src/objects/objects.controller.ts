import { Controller, Get } from '@nestjs/common';

import { ObjectsService } from './objects.service';

@Controller('objects')
export class ObjectsController {
  constructor(private readonly objectsService: ObjectsService) {}

  @Get('_module')
  getModuleStatus() {
    return this.objectsService.getModuleStatus();
  }
}
