import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';

import { validateCreateCollection, validateUpdateCollection } from './collection.validation';
import { CollectionsService } from './collections.service';

@Controller('collections')
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Get()
  listCollections(@Query('q') searchQuery?: string, @Query('visibility') visibility?: string) {
    return this.collectionsService.list(searchQuery, visibility);
  }

  @Post()
  createCollection(@Body() body: unknown) {
    return this.collectionsService.create(validateCreateCollection(body));
  }

  @Get(':id')
  getCollection(@Param('id') id: string) {
    return this.collectionsService.getById(id);
  }

  @Patch(':id')
  updateCollection(@Param('id') id: string, @Body() body: unknown) {
    return this.collectionsService.update(id, validateUpdateCollection(body));
  }

  @Delete(':id')
  deleteCollection(@Param('id') id: string) {
    return this.collectionsService.delete(id);
  }
}
