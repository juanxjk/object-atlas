import { Injectable } from '@nestjs/common';

import { DatabaseService } from './database/database.service';

@Injectable()
export class AppService {
  constructor(private readonly databaseService: DatabaseService) {}

  getHealth() {
    return {
      status: 'ok',
      database: {
        configured: this.databaseService.isConfigured()
      }
    };
  }
}
