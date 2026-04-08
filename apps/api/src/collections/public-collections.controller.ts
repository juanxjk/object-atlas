import { Controller, Get, Param } from '@nestjs/common';

import { CollectionsService } from './collections.service';

@Controller('public/collections')
export class PublicCollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Get(':publicId')
  getPublicCollection(@Param('publicId') publicId: string) {
    return this.collectionsService.getPublicCollection(publicId);
  }
}
