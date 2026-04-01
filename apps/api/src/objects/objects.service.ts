import { Injectable } from '@nestjs/common';

@Injectable()
export class ObjectsService {
  getModuleStatus() {
    return {
      status: 'ready',
      module: 'objects'
    };
  }
}
